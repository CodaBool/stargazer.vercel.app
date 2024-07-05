import { useCallback, useEffect, useRef, useState } from "react";
import { Point, subtractPoints, sumPoints } from "@visx/point";
import { localPoint } from "@visx/event";
import useStateWithCallback from "@visx/drag/lib/util/useStateWithCallback";
import restrictPoint from "@visx/drag/lib/util/restrictPoint";
import useSamplesAlongPath from "@visx/drag/lib/util/useSamplesAlongPath";
import { TransformMatrix } from "@visx/zoom/lib/types";

/** Hook for dragging, returns a `UseDrag` object. */
export default function useDrag({
  resetOnStart = false,
  snapToPointer = true,
  onDragEnd,
  onDragMove,
  onDragStart,
  x,
  y,
  dx,
  dy,
  isDragging,
  restrict = {},
  restrictToPath,
  zoomTransformMatrix
} = {}) {
  // use ref to detect prop changes
  const positionPropsRef = useRef({ x, y, dx, dy });

  const [dragState, setDragStateWithCallback] = useStateWithCallback(
    {
      x,
      y,
      dx: dx ?? 0,
      dy: dy ?? 0,
      isDragging: false
    }
  );

  // Track distance between pointer on dragStart and position of element being dragged
  const [dragStartPointerOffset, setDragStartPointerOffset] = useState(
    new Point({ x: 0, y: 0 })
  );

  // if prop position changes, update state
  useEffect(() => {
    if (
      positionPropsRef.current.x !== x ||
      positionPropsRef.current.y !== y ||
      positionPropsRef.current.dx !== dx ||
      positionPropsRef.current.dy !== dy
    ) {
      positionPropsRef.current = { x, y, dx, dy };
      setDragStateWithCallback((currState) => ({
        ...currState,
        x,
        y,
        dx: dx ?? 0,
        dy: dy ?? 0
      }));
    }
  });

  useEffect(() => {
    if (isDragging !== undefined && dragState.isDragging !== isDragging) {
      setDragStateWithCallback((currState) => ({ ...currState, isDragging }));
    }
  }, [dragState.isDragging, isDragging, setDragStateWithCallback]);

  const restrictToPathSamples = useSamplesAlongPath(restrictToPath);

  const handleDragStart = useCallback(
    (event) => {
      event.persist();

      setDragStateWithCallback(
        (currState) => {
          const { x = 0, y = 0, dx, dy } = currState;
          const currentPoint = new Point({
            x: (x || 0) + dx,
            y: (y || 0) + dy
          });
          const eventPoint = localPoint(event) || new Point({ x: 0, y: 0 });
          const point = snapToPointer ? eventPoint : currentPoint;
          const dragPoint = restrictPoint(
            point,
            restrictToPathSamples,
            restrict
          );

          setDragStartPointerOffset(subtractPoints(currentPoint, eventPoint));

          return {
            isDragging: true,
            dx: resetOnStart ? 0 : currState.dx,
            dy: resetOnStart ? 0 : currState.dy,
            x: resetOnStart ? dragPoint.x : dragPoint.x - currState.dx,
            y: resetOnStart ? dragPoint.y : dragPoint.y - currState.dy
          };
        },
        onDragStart &&
        ((currState) => {
          onDragStart({ ...currState, event });
        })
      );
    },
    [
      onDragStart,
      resetOnStart,
      restrict,
      restrictToPathSamples,
      setDragStateWithCallback,
      snapToPointer
    ]
  );

  const handleDragMove = useCallback(
    (event) => {
      event.persist();

      setDragStateWithCallback(
        (currState) => {
          if (!currState.isDragging) return currState;

          const { x = 0, y = 0 } = currState;
          const pointerPoint = localPoint(event) || new Point({ x: 0, y: 0 });
          const point = snapToPointer
            ? pointerPoint
            : sumPoints(pointerPoint, dragStartPointerOffset);
          const dragPoint = restrictPoint(
            point,
            restrictToPathSamples,
            restrict
          );
          return {
            ...currState,
            dx: (dragPoint.x - x) / (zoomTransformMatrix?.scaleX || 1),
            dy: (dragPoint.y - y) / (zoomTransformMatrix?.scaleY || 1)
          };
        },
        onDragMove &&
        ((currState) => {
          if (currState.isDragging) onDragMove({ ...currState, event });
        })
      );
    },
    [
      setDragStateWithCallback,
      onDragMove,
      snapToPointer,
      dragStartPointerOffset,
      restrictToPathSamples,
      restrict,
      zoomTransformMatrix.scaleX,
      zoomTransformMatrix.scaleY
    ]
  );

  const handleDragEnd = useCallback(
    (event) => {
      event.persist();

      setDragStateWithCallback(
        (currState) => ({ ...currState, isDragging: false }),
        onDragEnd &&
        ((currState) => {
          onDragEnd({ ...currState, event });
        })
      );
    },
    [onDragEnd, setDragStateWithCallback]
  );

  return {
    ...dragState,
  };
}
