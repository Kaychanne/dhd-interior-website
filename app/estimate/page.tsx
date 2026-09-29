'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bed, 
  Sofa, 
  Utensils, 
  Bath, 
  Briefcase, 
  Coffee, 
  Grid, 
  Trash2, 
  Sparkles,
  ArrowRight,
  MousePointer,
  Square,
  Activity,
  ZoomIn,
  ZoomOut,
  Pencil,
  PlusSquare,
  PlusCircle,
  LucideIcon
} from 'lucide-react';

import Navbar from '@/Components/Navbar/Navbar'; 
import Footer from '@/Components/Footer/Footer';
import styles from './estimate.module.css';

interface SpaceType {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface FurniturePreset {
  id: string;
  name: string;
  defaultLength: number;
  defaultWidth: number;
  defaultHeight: number;
  ratePerSqm: number;
}

interface FurnitureItem {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  ratePerSqm: number;
}

interface Point {
  x: number;
  y: number;
}

interface Wall {
  id: string;
  length: number;
  label: string;
}

interface AreaSection {
  id: string;
  name: string;
  walls: Wall[];
  points: Point[];
  customSqm: number;
}

const SPACE_TYPES: SpaceType[] = [
  { id: 'bedroom', label: 'Bedroom', icon: Bed },
  { id: 'living', label: 'Living Room', icon: Sofa },
  { id: 'kitchen', label: 'Kitchen', icon: Utensils },
  { id: 'guest', label: 'Guest Room', icon: Bath },
  { id: 'office', label: 'Office', icon: Briefcase },
  { id: 'cafe', label: 'Cafe / Restaurant', icon: Coffee },
  { id: 'other', label: 'Other Space', icon: Grid },
];

const PRESET_FURNITURE_OPTIONS: FurniturePreset[] = [
  { id: 'wardrobe', name: 'Wardrobe', defaultLength: 2.0, defaultWidth: 0.6, defaultHeight: 2.8, ratePerSqm: 2500000 },
  { id: 'tv_panel', name: 'TV Panel & Console', defaultLength: 2.5, defaultWidth: 0.4, defaultHeight: 2.4, ratePerSqm: 2200000 },
  { id: 'headboard', name: 'Bed Panel / Headboard', defaultLength: 2.0, defaultWidth: 0.2, defaultHeight: 1.8, ratePerSqm: 1800000 },
  { id: 'flooring', name: 'Laminate / Ceramic Flooring', defaultLength: 4.0, defaultWidth: 4.0, defaultHeight: 0.01, ratePerSqm: 350000 },
  { id: 'desk', name: 'Study / Working Desk', defaultLength: 1.5, defaultWidth: 0.6, defaultHeight: 0.75, ratePerSqm: 1900000 },
  { id: 'mirror', name: 'Custom Accent Mirror', defaultLength: 1.2, defaultWidth: 0.1, defaultHeight: 2.0, ratePerSqm: 1200000 },
  { id: 'shelves', name: 'Floating Wall Shelves', defaultLength: 1.8, defaultWidth: 0.3, defaultHeight: 0.4, ratePerSqm: 950000 }
];

export default function EstimatePage() {
  const [selectedSpace, setSelectedSpace] = useState<string>('bedroom');
  const [customSpaceName, setCustomSpaceName] = useState<string>('');
  const [shape, setShape] = useState<'rectangle' | 'custom'>('custom');

  const [roomLength, setRoomLength] = useState<number>(4.00);
  const [roomWidth, setRoomWidth] = useState<number>(4.00);
  const [roomHeight, setRoomHeight] = useState<number>(3.00);

  const designFeeRate = 150000;
  const consultationFee = 450000;

  // State Kosong
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [areas, setAreas] = useState<AreaSection[]>([]);

  const [selectedAddItem, setSelectedAddItem] = useState<string>('');
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'rectangle'>('select');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

  // State Input Manual Furniture Custom (Tanpa Input Harga)
  const [isCustomFurnitureInput, setIsCustomFurnitureInput] = useState<boolean>(false);
  const [manualFurnitureName, setManualFurnitureName] = useState<string>('');
  const [manualLength, setManualLength] = useState<number>(1.0);
  const [manualWidth, setManualWidth] = useState<number>(0.5);
  const [manualHeight, setManualHeight] = useState<number>(1.0);

  // State Rectangle Tool
  const [rectStartPoint, setRectStartPoint] = useState<Point | null>(null);
  const [rectCurrentPoint, setRectCurrentPoint] = useState<Point | null>(null);
  const [isDrawingRect, setIsDrawingRect] = useState<boolean>(false);

  // State Dragging Point
  const [draggedAreaPointInfo, setDraggedAreaPointInfo] = useState<{ areaId: string; pointIdx: number } | null>(null);
  const [draggedCurrentPointIdx, setDraggedCurrentPointIdx] = useState<number | null>(null);

  // Helper kalkulasi ulang dinding & luas
  const calculateAreaFromPointsList = (pts: Point[]) => {
    const newWalls: Wall[] = pts.map((pt, idx) => {
      const nextPt = pts[(idx + 1) % pts.length];
      const pxLength = Math.hypot(nextPt.x - pt.x, nextPt.y - pt.y);
      const meters = parseFloat((pxLength / 35).toFixed(1)) || 1.0;
      return {
        id: `wall-${idx}`,
        length: meters,
        label: `${meters}m`
      };
    });

    let areaPx = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      areaPx += pts[i].x * pts[j].y;
      areaPx -= pts[j].x * pts[i].y;
    }
    const calculatedSqm = parseFloat(Math.abs(areaPx / (35 * 35)).toFixed(2)) || 1.0;

    return { newWalls, calculatedSqm };
  };

  const createAreaFromPoints = (pointsList: Point[]) => {
    if (pointsList.length < 3) return;

    const { newWalls, calculatedSqm } = calculateAreaFromPointsList(pointsList);

    const newArea: AreaSection = {
      id: `area-${Date.now()}`,
      name: `Area ${areas.length + 1}`,
      points: pointsList,
      walls: newWalls,
      customSqm: calculatedSqm
    };

    setAreas((prev) => [...prev, newArea]);
  };

  // MOUSE HANDLERS FOR CANVAS
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'rectangle') {
      const rect = e.currentTarget.getBoundingClientRect();
      const snapX = Math.round(((e.clientX - rect.left) / zoomLevel) / 20) * 20;
      const snapY = Math.round(((e.clientY - rect.top) / zoomLevel) / 20) * 20;

      setRectStartPoint({ x: snapX, y: snapY });
      setRectCurrentPoint({ x: snapX, y: snapY });
      setIsDrawingRect(true);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const snapX = Math.round(((e.clientX - rect.left) / zoomLevel) / 20) * 20;
    const snapY = Math.round(((e.clientY - rect.top) / zoomLevel) / 20) * 20;

    if (draggedCurrentPointIdx !== null) {
      setCurrentPoints(prevPts => {
        const updated = [...prevPts];
        updated[draggedCurrentPointIdx] = { x: snapX, y: snapY };
        return updated;
      });
      return;
    }

    if (draggedAreaPointInfo) {
      setAreas(prevAreas => prevAreas.map(area => {
        if (area.id === draggedAreaPointInfo.areaId) {
          const updatedPoints = [...area.points];
          updatedPoints[draggedAreaPointInfo.pointIdx] = { x: snapX, y: snapY };

          const { newWalls, calculatedSqm } = calculateAreaFromPointsList(updatedPoints);
          return {
            ...area,
            points: updatedPoints,
            walls: newWalls,
            customSqm: calculatedSqm
          };
        }
        return area;
      }));
      return;
    }

    if (isDrawingRect && activeTool === 'rectangle') {
      setRectCurrentPoint({ x: snapX, y: snapY });
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggedCurrentPointIdx !== null) {
      setDraggedCurrentPointIdx(null);
      return;
    }

    if (draggedAreaPointInfo) {
      setDraggedAreaPointInfo(null);
      return;
    }

    if (isDrawingRect && rectStartPoint && rectCurrentPoint) {
      const x1 = Math.min(rectStartPoint.x, rectCurrentPoint.x);
      const x2 = Math.max(rectStartPoint.x, rectCurrentPoint.x);
      const y1 = Math.min(rectStartPoint.y, rectCurrentPoint.y);
      const y2 = Math.max(rectStartPoint.y, rectCurrentPoint.y);

      if (x2 - x1 >= 20 && y2 - y1 >= 20) {
        const rectPoints: Point[] = [
          { x: x1, y: y1 },
          { x: x2, y: y1 },
          { x: x2, y: y2 },
          { x: x1, y: y2 }
        ];
        createAreaFromPoints(rectPoints);
      }
    }
    setIsDrawingRect(false);
    setRectStartPoint(null);
    setRectCurrentPoint(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'draw') return;

    if (draggedCurrentPointIdx !== null || draggedAreaPointInfo !== null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const snapX = Math.round(((e.clientX - rect.left) / zoomLevel) / 20) * 20;
    const snapY = Math.round(((e.clientY - rect.top) / zoomLevel) / 20) * 20;

    if (currentPoints.length >= 3) {
      const startPoint = currentPoints[0];
      const dist = Math.hypot(snapX - startPoint.x, snapY - startPoint.y);
      if (dist < 25) {
        createAreaFromPoints(currentPoints);
        setCurrentPoints([]);
        setActiveTool('select');
        return;
      }
    }

    setCurrentPoints([...currentPoints, { x: snapX, y: snapY }]);
  };

  const handleUpdateWallLength = (areaId: string, wallIdx: number, newMeters: string) => {
    const val = parseFloat(newMeters) || 0;
    setAreas(areas.map(area => {
      if (area.id === areaId) {
        const updatedWalls = [...area.walls];
        updatedWalls[wallIdx] = {
          ...updatedWalls[wallIdx],
          length: val,
          label: `${val}m`
        };

        const totalWallLen = updatedWalls.reduce((sum, w) => sum + w.length, 0);
        const avgSide = totalWallLen / updatedWalls.length;
        const newAreaEstimate = parseFloat((avgSide * avgSide * 0.85).toFixed(2));

        return {
          ...area,
          walls: updatedWalls,
          customSqm: newAreaEstimate > 0 ? newAreaEstimate : area.customSqm
        };
      }
      return area;
    }));
  };

  const handleRemoveArea = (areaId: string) => {
    setAreas(areas.filter(a => a.id !== areaId));
  };

  const calculatedRoomArea = useMemo(() => {
    if (shape === 'custom') {
      const sum = areas.reduce((acc, curr) => acc + (parseFloat(curr.customSqm.toString()) || 0), 0);
      return parseFloat(sum.toFixed(2));
    }
    const len = parseFloat(roomLength.toString()) || 0;
    const wid = parseFloat(roomWidth.toString()) || 0;
    return parseFloat((len * wid).toFixed(2));
  }, [shape, roomLength, roomWidth, areas]);

  const totalDesignFee = useMemo(() => {
    return calculatedRoomArea * designFeeRate;
  }, [calculatedRoomArea]);

  const itemsWithSubtotals = useMemo(() => {
    return items.map(item => {
      const l = parseFloat(item.length.toString()) || 0;
      const h = parseFloat(item.height.toString()) || 0;
      const w = parseFloat(item.width.toString()) || 0;
      const rate = parseFloat(item.ratePerSqm.toString()) || 0;

      let area = l * h;
      if (item.name.toLowerCase().includes('flooring') || item.name.toLowerCase().includes('lanta')) {
        area = l * w;
      }
      const subtotal = Math.round(area * rate);
      return { ...item, calculatedArea: area.toFixed(2), subtotal };
    });
  }, [items]);

  const totalFurnitureSubtotal = useMemo(() => {
    return itemsWithSubtotals.reduce((acc, curr) => acc + curr.subtotal, 0);
  }, [itemsWithSubtotals]);

  const grandTotal = useMemo(() => {
    return totalDesignFee + totalFurnitureSubtotal + consultationFee;
  }, [totalDesignFee, totalFurnitureSubtotal, consultationFee]);

  const handleAddItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const optionId = e.target.value;
    if (!optionId) return;

    if (optionId === 'custom_manual') {
      setIsCustomFurnitureInput(true);
      setSelectedAddItem('');
      return;
    }

    const preset = PRESET_FURNITURE_OPTIONS.find(p => p.id === optionId);
    if (preset) {
      const newItem: FurnitureItem = {
        id: `item-${Date.now()}`,
        name: preset.name,
        length: preset.defaultLength,
        width: preset.defaultWidth,
        height: preset.defaultHeight,
        ratePerSqm: preset.ratePerSqm
      };
      setItems([...items, newItem]);
    }
    setSelectedAddItem('');
  };

  const handleAddManualCustomFurniture = () => {
    if (!manualFurnitureName.trim()) return;

    // Fixed default rate per sqm (harga sistem statis)
    const fixedRatePerSqm = 1800000;

    const newItem: FurnitureItem = {
      id: `item-${Date.now()}`,
      name: manualFurnitureName.trim(),
      length: manualLength,
      width: manualWidth,
      height: manualHeight,
      ratePerSqm: fixedRatePerSqm
    };

    setItems([...items, newItem]);

    // Reset Form Input
    setManualFurnitureName('');
    setManualLength(1.0);
    setManualWidth(0.5);
    setManualHeight(1.0);
    setIsCustomFurnitureInput(false);
  };

  const handleUpdateItem = (id: string, field: keyof FurnitureItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const activeSpaceLabel = selectedSpace === 'other' 
    ? (customSpaceName.trim() || 'Other Space') 
    : SPACE_TYPES.find(s => s.id === selectedSpace)?.label || '';

  return (
    <div className={styles.pageContainer}>
      <Navbar />


      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Get an Initial <span className={styles.highlightText}>Project Estimate</span>
        </h1>
        <p className={styles.heroDesc}>
          Tell us about your space. Draw custom wall lines, drag points to adjust positions, or put rectangle shapes.
        </p>
      </section>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        <div className={styles.gridWrapper}>
          
          {/* LEFT FORM */}
          <div className={styles.leftColumn}>
            
            {/* AREA SELECTION */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.stepNumber}>1.</span> Area Selection
              </h2>
              <p className={styles.cardSub}>What type of space are you planning to design?</p>

              <div className={styles.areaGrid}>
                {SPACE_TYPES.map((space) => {
                  const Icon = space.icon;
                  const isSelected = selectedSpace === space.id;
                  return (
                    <button
                      key={space.id}
                      onClick={() => setSelectedSpace(space.id)}
                      className={`${styles.areaBtn} ${isSelected ? styles.areaBtnSelected : ''}`}
                    >
                      <div className={`${styles.iconBox} ${isSelected ? styles.iconBoxSelected : ''}`}>
                        <Icon size={22} />
                      </div>
                      <span className={isSelected ? styles.areaLabelSelected : styles.areaLabel}>
                        {space.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* INPUT CUSTOM SPACE */}
              {selectedSpace === 'other' && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0' }}>
                  <label className={styles.inputLabel} style={{ fontWeight: 'bold', color: '#0f172a' }}>
                    Custom Space Name / Nama Ruangan Custom:
                  </label>
                  <input
                    type="text"
                    value={customSpaceName}
                    onChange={(e) => setCustomSpaceName(e.target.value)}
                    placeholder="Contoh: Studio Musik, Musholla, Storage Room..."
                    className={styles.inputField}
                    style={{ marginTop: '0.5rem' }}
                  />
                </div>
              )}
            </div>

            {/* ROOM DIMENSIONS */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.stepNumber}>2.</span> Room Dimensions
              </h2>
              <p className={styles.cardSub}>
                Select 'Custom Shape' to draw lines, drag points with your cursor to adjust positions, or drag rectangles.
              </p>

              {/* Mode Toggles */}
              <div className={styles.modeGrid}>
                <button
                  onClick={() => setShape('rectangle')}
                  className={`${styles.modeBtn} ${shape === 'rectangle' ? styles.modeBtnActive : ''}`}
                >
                  <Square size={24} className={styles.modeIcon} />
                  <div className={styles.modeTitle}>Rectangle</div>
                  <div className={styles.modeDesc}>Standard 4-side room</div>
                </button>

                <button
                  onClick={() => setShape('custom')}
                  className={`${styles.modeBtn} ${shape === 'custom' ? styles.modeBtnCustomActive : ''}`}
                >
                  <Activity size={24} className={styles.modeCustomIcon} />
                  <div className={styles.modeTitle}>Custom Shape</div>
                  <div className={styles.modeDesc}>Interactive Canvas Drawer</div>
                </button>
              </div>

              {/* RECTANGLE MODE */}
              {shape === 'rectangle' && (
                <div className={styles.rectContainer}>
                  <label className={styles.rectLabel}>Standard Room Dimensions ({activeSpaceLabel})</label>
                  <div className={styles.rectInputsGrid}>
                    <div>
                      <label className={styles.inputLabel}>Length (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={roomLength}
                        onChange={(e) => setRoomLength(parseFloat(e.target.value) || 0)}
                        className={styles.inputField}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Width (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={roomWidth}
                        onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 0)}
                        className={styles.inputField}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Height (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={roomHeight}
                        onChange={(e) => setRoomHeight(parseFloat(e.target.value) || 0)}
                        className={styles.inputField}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CUSTOM CANVAS MODE */}
              {shape === 'custom' && (
                <div className={styles.canvasWrapper}>
                  <div className={styles.canvasInner}>
                    <div className={styles.toolbar}>
                      <button
                        onClick={() => setActiveTool('select')}
                        className={`${styles.toolIconBtn} ${activeTool === 'select' ? styles.toolIconBtnActive : ''}`}
                        title="Select & Drag Point Tool"
                      >
                        <MousePointer size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setActiveTool('draw');
                          setCurrentPoints([]);
                        }}
                        className={`${styles.toolIconBtn} ${activeTool === 'draw' ? styles.toolIconBtnDrawActive : ''}`}
                        title="Draw Custom Lines (Click Point by Point)"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setActiveTool('rectangle');
                          setCurrentPoints([]);
                        }}
                        className={`${styles.toolIconBtn} ${activeTool === 'rectangle' ? styles.toolIconBtnDrawActive : ''}`}
                        title="Put / Drag Rectangle Area"
                      >
                        <PlusSquare size={18} />
                      </button>

                      <div className={styles.toolbarDivider}></div>

                      <button onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.1))} className={styles.toolIconBtn} title="Zoom Out">
                        <ZoomOut size={16} />
                      </button>

                      <button onClick={() => setZoomLevel(Math.min(1.8, zoomLevel + 0.1))} className={styles.toolIconBtn} title="Zoom In">
                        <ZoomIn size={16} />
                      </button>
                    </div>

                    {/* Canvas Plotter */}
                    <div 
                      className={styles.plotterArea} 
                      onClick={handleCanvasClick}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                    >
                      <div className={styles.areaBadgeOverlay}>
                        <span className={styles.areaBadge}>
                          Total Area ({activeSpaceLabel}): {calculatedRoomArea} m²
                        </span>
                      </div>

                      <svg 
                        className={styles.svgCanvas}
                        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                      >
                        {/* 1. AREA YANG SUDAH TERBENTUK */}
                        {areas.map((area) => {
                          const pts = area.points;
                          const pathStr = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
                          const avgX = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
                          const avgY = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;

                          return (
                            <g key={area.id}>
                              <path d={pathStr} fill="#C7D2FE" stroke="#3730A3" strokeWidth="3" />

                              <text x={avgX} y={avgY - 8} textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="bold">
                                {area.name}
                              </text>
                              <text x={avgX} y={avgY + 12} textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900">
                                {area.customSqm} m²
                              </text>

                              {/* DINDING & UKURAN */}
                              {pts.map((pt, idx) => {
                                const nextPt = pts[(idx + 1) % pts.length];
                                const wallInfo = area.walls[idx] || { length: 4.0, label: '4m' };

                                const midX = (pt.x + nextPt.x) / 2;
                                const midY = (pt.y + nextPt.y) / 2;
                                const dx = nextPt.x - pt.x;
                                const dy = nextPt.y - pt.y;
                                const len = Math.hypot(dx, dy) || 1;

                                const nx = -dy / len * 22;
                                const ny = dx / len * 22;

                                const offX1 = pt.x + nx;
                                const offY1 = pt.y + ny;
                                const offX2 = nextPt.x + nx;
                                const offY2 = nextPt.y + ny;
                                const labelX = midX + nx * 1.3;
                                const labelY = midY + ny * 1.3;

                                return (
                                  <g key={`dim-${area.id}-${idx}`}>
                                    <line x1={offX1} y1={offY1} x2={offX2} y2={offY2} stroke="#B45309" strokeWidth="2" strokeDasharray="4 2" />
                                    <circle cx={offX1} cy={offY1} r="3" fill="#B45309" />
                                    <circle cx={offX2} cy={offY2} r="3" fill="#B45309" />

                                    <foreignObject x={labelX - 28} y={labelY - 14} width="56" height="28">
                                      <div className={styles.orangeDimensionInput}>
                                        <input
                                          type="number"
                                          step="0.1"
                                          value={wallInfo.length}
                                          onChange={(e) => handleUpdateWallLength(area.id, idx, e.target.value)}
                                          className={styles.orangeInput}
                                        />
                                        <span className={styles.orangeInputUnit}>m</span>
                                      </div>
                                    </foreignObject>
                                  </g>
                                );
                              })}

                              {/* TITIK SUDUT DRAGGABLE (AREA JADI) */}
                              {pts.map((pt, pIdx) => (
                                <circle
                                  key={`corner-${area.id}-${pIdx}`}
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="7"
                                  fill="#3730A3"
                                  stroke="#FFFFFF"
                                  strokeWidth="2"
                                  style={{ cursor: 'grab' }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setDraggedAreaPointInfo({ areaId: area.id, pointIdx: pIdx });
                                  }}
                                />
                              ))}
                            </g>
                          );
                        })}

                        {/* 2. GARIS & TITIK SEMENTARA (DRAW MODE) */}
                        {currentPoints.map((pt, idx) => (
                          <g key={`draw-pt-${idx}`}>
                            {idx > 0 && (
                              <line 
                                x1={currentPoints[idx-1].x} 
                                y1={currentPoints[idx-1].y} 
                                x2={pt.x} 
                                y2={pt.y} 
                                stroke="#F59E0B" 
                                strokeWidth="3" 
                              />
                            )}
                            <circle 
                              cx={pt.x} 
                              cy={pt.y} 
                              r="7" 
                              fill="#F59E0B" 
                              stroke="#FFFFFF" 
                              strokeWidth="2" 
                              style={{ cursor: 'grab' }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggedCurrentPointIdx(idx);
                              }}
                            />
                          </g>
                        ))}

                        {/* 3. PREVIEW DRAG RECTANGLE */}
                        {isDrawingRect && rectStartPoint && rectCurrentPoint && (
                          <rect
                            x={Math.min(rectStartPoint.x, rectCurrentPoint.x)}
                            y={Math.min(rectStartPoint.y, rectCurrentPoint.y)}
                            width={Math.abs(rectCurrentPoint.x - rectStartPoint.x)}
                            height={Math.abs(rectCurrentPoint.y - rectStartPoint.y)}
                            fill="rgba(245, 158, 11, 0.2)"
                            stroke="#F59E0B"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                          />
                        )}
                      </svg>
                    </div>
                  </div>

                  {/* Area Details List */}
                  {areas.length > 0 && (
                    <div className={styles.areaDetailsPanel}>
                      <div className={styles.areaDetailsGrid}>
                        {areas.map((a) => (
                          <div key={a.id} className={styles.areaDetailCard}>
                            <div className={styles.areaDetailHeader}>
                              <strong>{a.name}</strong>
                              <span className={styles.areaDetailSqm}>{a.customSqm} m²</span>
                              <button onClick={() => handleRemoveArea(a.id)} className={styles.removeAreaBtn}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className={styles.wallsGrid}>
                              {a.walls.map((w, wIdx) => (
                                <div key={w.id} className={styles.wallItemRow}>
                                  <span className={styles.wallLabel}>Side {wIdx + 1}:</span>
                                  <input 
                                    type="number"
                                    step="0.1"
                                    value={w.length}
                                    onChange={(e) => handleUpdateWallLength(a.id, wIdx, e.target.value)}
                                    className={styles.wallInput}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FURNITURE ITEMS SECTION */}
              <div className={styles.furnitureSection}>
                <h3 className={styles.furnitureTitle}>CUSTOM ITEMS & FURNITURE</h3>

                {itemsWithSubtotals.length > 0 ? (
                  <div className={styles.furnitureList}>
                    {itemsWithSubtotals.map((item, index) => (
                      /* DESAIN CARD PERSIS SEPERTI DI GAMBAR CONTOH */
                      <div 
                        key={item.id} 
                        style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: '0.875rem',
                          border: '1px solid #e2e8f0',
                          padding: '1.25rem 1.5rem',
                          position: 'relative'
                        }}
                      >
                        <div className={styles.itemCardHeader} style={{ marginBottom: '1rem' }}>
                          <div className={styles.itemNameWrapper} style={{ gap: '0.625rem' }}>
                            <span 
                              className={styles.itemBadge} 
                              style={{ 
                                backgroundColor: '#f59e0b', 
                                color: '#ffffff', 
                                width: '1.5rem', 
                                height: '1.5rem', 
                                fontSize: '0.875rem', 
                                fontWeight: 'bold' 
                              }}
                            >
                              {index + 1}
                            </span>
                            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>
                              {item.name}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => handleRemoveItem(item.id)} 
                            className={styles.removeItemBtn}
                            style={{ color: '#94a3b8' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className={styles.itemDimensionsGrid}>
                          <div>
                            <label className={styles.inputLabel}>Length (m)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={item.length}
                              onChange={(e) => handleUpdateItem(item.id, 'length', parseFloat(e.target.value) || 0)}
                              className={styles.inputField}
                            />
                          </div>
                          <div>
                            <label className={styles.inputLabel}>Width (m)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={item.width}
                              onChange={(e) => handleUpdateItem(item.id, 'width', parseFloat(e.target.value) || 0)}
                              className={styles.inputField}
                            />
                          </div>
                          <div>
                            <label className={styles.inputLabel}>Height (m)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={item.height}
                              onChange={(e) => handleUpdateItem(item.id, 'height', parseFloat(e.target.value) || 0)}
                              className={styles.inputField}
                            />
                          </div>
                          <div>
                            <label className={styles.inputLabel}>Subtotal Est.</label>
                            <div 
                              style={{
                                backgroundColor: '#fef3c7',
                                border: '1px solid #fde68a',
                                borderRadius: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                color: '#0f172a',
                                textAlign: 'right'
                              }}
                            >
                              {formatIDR(item.subtotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '1rem' }}>
                    Belum ada furniture yang ditambahkan. Silakan pilih menu di bawah.
                  </p>
                )}

                {/* FORM INPUT MANUAL CUSTOM ITEM (HANYA DIMENSI, HARGA TIDAK BISA DIATUR) */}
                {isCustomFurnitureInput && (
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <PlusCircle size={16} style={{ color: '#d97706' }} /> Add Custom Item
                      </strong>
                      <button 
                        onClick={() => setIsCustomFurnitureInput(false)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Batal
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                      <div>
                        <label className={styles.inputLabel}>Nama Custom Item</label>
                        <input
                          type="text"
                          value={manualFurnitureName}
                          onChange={(e) => setManualFurnitureName(e.target.value)}
                          placeholder="misal: Meja Bar, Cabinet Wastafel, Laci Custom..."
                          className={styles.inputField}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        <div>
                          <label className={styles.inputLabel}>Length (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={manualLength}
                            onChange={(e) => setManualLength(parseFloat(e.target.value) || 0)}
                            className={styles.inputField}
                          />
                        </div>
                        <div>
                          <label className={styles.inputLabel}>Width (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={manualWidth}
                            onChange={(e) => setManualWidth(parseFloat(e.target.value) || 0)}
                            className={styles.inputField}
                          />
                        </div>
                        <div>
                          <label className={styles.inputLabel}>Height (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={manualHeight}
                            onChange={(e) => setManualHeight(parseFloat(e.target.value) || 0)}
                            className={styles.inputField}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleAddManualCustomFurniture}
                        style={{
                          backgroundColor: '#2d3e50',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.625rem 1rem',
                          borderRadius: '0.375rem',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          marginTop: '0.25rem'
                        }}
                      >
                        + Tambahkan ke Daftar
                      </button>
                    </div>
                  </div>
                )}

                <div className={styles.addSelectWrapper}>
                  <select
                    value={selectedAddItem}
                    onChange={handleAddItem}
                    className={styles.addSelect}
                  >
                    <option value="" disabled>+ Add Furniture Item...</option>
                    
                    {/* OPSI INPUT MANUAL */}
                    <option value="custom_manual" style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                      ✏️ + Add Custom Item (Manual Input)
                    </option>

                    <option disabled>──────────</option>

                    {/* PRESET ITEMS */}
                    {PRESET_FURNITURE_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        + Add {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT SUMMARY SIDEBAR */}
          <div className={styles.rightColumn}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <div>
                  <h3 className={styles.summaryTitle}>Estimate Cost Summary</h3>
                  <p className={styles.summarySub}>{activeSpaceLabel}</p>
                </div>
                <Sparkles size={18} style={{ color: '#f59e0b' }} />
              </div>

              <div className={styles.summaryBody}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryRowLabel}>Total Room Area</span>
                  <strong className={styles.summaryRowBadge}>{calculatedRoomArea} m²</strong>
                </div>

                <div className={styles.summaryRow}>
                  <div>
                    <span className={styles.feeLabel}>Interior Design Fee</span>
                    <span className={styles.feeSubtext}>@ Rp 150.000 / m²</span>
                  </div>
                  <strong>{formatIDR(totalDesignFee)}</strong>
                </div>

                <div className={styles.summaryRow}>
                  <div>
                    <span className={styles.feeLabel}>Furniture Items ({items.length})</span>
                    <span className={styles.feeSubtext}>Custom build rate</span>
                  </div>
                  <strong>{formatIDR(totalFurnitureSubtotal)}</strong>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.feeLabel}>Fixed Consultation Fee</span>
                  <strong>{formatIDR(consultationFee)}</strong>
                </div>

                <div className={styles.grandTotalBox}>
                  <span className={styles.grandTotalLabel}>Estimated Total</span>
                  <div className={styles.grandTotalText}>{formatIDR(grandTotal)}</div>
                </div>

                <button className={styles.ctaPrimaryBtn}>
                  <span>Get a Consultation</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}