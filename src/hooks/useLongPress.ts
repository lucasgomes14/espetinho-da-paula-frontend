import { useRef, useCallback } from "react";

interface LongPressOptions {
    onLongPress: (e: React.SyntheticEvent) => void;
    onClick?: (e: React.SyntheticEvent) => void;
    delay?: number;
}

export function useLongPress({ onLongPress, onClick, delay = 600 }: LongPressOptions) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const start = useCallback((e: React.SyntheticEvent) => {
        timeoutRef.current = setTimeout(() => {
            onLongPress(e);
        }, delay);
    }, [onLongPress, delay]);

    const clear = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    return {
        onMouseDown: start,
        onTouchStart: start,
        onMouseUp: clear,
        onMouseLeave: clear,
        onTouchEnd: clear,
        onContextMenu: (e: React.MouseEvent) => {
            e.preventDefault();
            onLongPress(e);
        },
        onClick: (e: React.MouseEvent) => {
            if (onClick) onClick(e);
        }
    };
}
