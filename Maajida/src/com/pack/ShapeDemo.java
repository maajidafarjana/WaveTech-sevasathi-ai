package com.pack;
//Abstract class Shape
abstract class Shape {
abstract double calculateArea();
abstract double calculatePerimeter();
}
//Subclass Circle extends Shape
class Circle extends Shape {
private double radius;
public Circle(double radius) {
this.radius = radius;
}
@Override
double calculateArea() {
return Math.PI * radius * radius;
}
@Override
double calculatePerimeter() {
	return 2 * Math.PI * radius;
}
}
//Subclass Triangle extends Shape
class Triangle extends Shape {
private double side1, side2, side3;
public Triangle(double side1, double side2, double side3) {
this.side1 = side1;
this.side2 = side2;
this.side3 = side3;
}
@Override
double calculateArea() {
double s = (side1 + side2 + side3) / 2; // Semi-perimeter
return Math.sqrt(s * (s - side1) * (s - side2) * (s - side3)); // Heron's formula
}
@Override
double calculatePerimeter() {
return side1 + side2 + side3;
}
}
//Main class to test Circle and Triangle
public class ShapeDemo {
public static void main(String[] args) {
Circle circle = new Circle(5.0);
Triangle triangle = new Triangle(3.0, 4.0, 5.0);
System.out.println("Circle Area: " + circle.calculateArea());
System.out.println("Circle Perimeter: " + circle.calculatePerimeter());
System.out.println("Triangle Area: " + triangle.calculateArea());
System.out.println("Triangle Perimeter: " + triangle.calculatePerimeter());
}
}