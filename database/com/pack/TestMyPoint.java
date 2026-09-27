package com.pack;

//Class to represent a point
class MyPoint {
 private int x; // x-coordinate
 private int y; // y-coordinate

 // Default constructor - initializes to (0, 0)
 public MyPoint() {
     x = 0;
     y = 0;
 }

 // Parameterized constructor
 public MyPoint(int x, int y) {
     this.x = x;
     this.y = y;
 }

 // Method to set both x and y
 public void setXY(int x, int y) {
     this.x = x;
     this.y = y;
 }

 // Method to get both x and y as an array
 public int[] getXY() {
     int[] coordinates = {x, y};
     return coordinates;
 }

 // Method to return coordinates as a string
 public String toString() {
     return "(" + x + "," + y + ")";
 }

 // Method to find distance from this point to (x, y)
 public double distance(int x, int y) {
     int dx = this.x - x;
     int dy = this.y - y;
     return Math.sqrt(dx * dx + dy * dy);
 }

 // Method to find distance from this point to another point
 public double distance(MyPoint another) {
     int dx = this.x - another.x;
     int dy = this.y - another.y;
     return Math.sqrt(dx * dx + dy * dy);
 }

 // Method to find distance from this point to origin (0, 0)
 public double distance() {
     return Math.sqrt(x * x + y * y);
 }
}

//Class to test MyPoint
class TestMyPoint {
 public static void main(String[] args) {
     // Create two MyPoint objects
     MyPoint point1 = new MyPoint();        // Default (0, 0)
     MyPoint point2 = new MyPoint(3, 4);    // (3, 4)

     // Display both points
     System.out.println("Point 1: " + point1);
     System.out.println("Point 2: " + point2);

     // Set new coordinates for Point 1
     point1.setXY(1, 2);
     System.out.println("New coordinates for Point 1: " + point1);

     // Get coordinates of Point 2
     int[] coords = point2.getXY();
     System.out.println("Coordinates of Point 2: (" + coords[0] + "," + coords[1] + ")");

     // Calculate distances
     System.out.println("Distance from Point 1 to (4, 6): " + point1.distance(4, 6));
     System.out.println("Distance from Point 1 to Point 2: " + point1.distance(point2));
     System.out.println("Distance from Point 1 to Origin (0, 0): " + point1.distance());
 }
}
