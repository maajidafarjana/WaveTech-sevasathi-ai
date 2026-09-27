
public class TryCatchDemo {
		public static void main(String[] args) {
		int a = 10, b = 0;
		try {
		int result = a / b;
		System.out.println(result);
		} catch (ArithmeticException e) {
		System.out.println("Cannot divide by zero.");
		}
		}
		}