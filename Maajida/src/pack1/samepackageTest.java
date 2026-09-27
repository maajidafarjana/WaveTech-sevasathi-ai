package pack1;

public class samepackageTest {
	public static void main(String[] args) {
	AccessDemo obj = new AccessDemo();
	System.out.println(obj.publicNumber);
	System.out.println(obj.defaultNumber);
	obj.publicMethod();
	obj.defaultMethod();
	}
	}