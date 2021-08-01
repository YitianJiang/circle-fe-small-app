export function checkPointInRectangle(point, rectangle) {
    return point.clientX > rectangle.left && point.clientX < rectangle.right &&
        point.clientY > rectangle.top && point.clientY < rectangle.bottom
}