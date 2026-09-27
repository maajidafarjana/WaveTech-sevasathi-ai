package com.example.demo;
public class packageDemo {
public void showMessage() {
System.out.println("Hello from PackageDemo");
}
public static void main(String[] args) {
packageDemo obj = new packageDemo();
obj.showMessage();
}
}