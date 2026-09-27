package pack1;

public class AccessDemo {
public int publicNumber = 10;
int defaultNumber = 20;
public void publicMethod() {
System.out.println("publicMethod() in pack1.AccessDemo");
}
void defaultMethod() {
System.out.println("defaultMethod() in pack1.AccessDemo");
}
}