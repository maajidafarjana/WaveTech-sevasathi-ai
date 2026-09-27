package pack2;

import pack1.AccessDemo;
public class DifferentPackageTest {
public static void main(String[] args) {
AccessDemo obj = new AccessDemo();
System.out.println(obj.publicNumber);
// obj.defaultNumber; // NOT allowed
obj.publicMethod();
}
}