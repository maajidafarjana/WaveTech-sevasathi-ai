
public class NestedTryDemo {

		public static void main(String[] args) {
		try {
		try {
		int[] arr = {1,2,3};
		System.out.println(arr[5]);
		} catch (ArrayIndexOutOfBoundsException e) {
		System.out.println("Inner catch");
		}
		int x = 10, y = 0;
		int res = x / y;
		} catch (ArithmeticException e) {
		System.out.println("Outer catch");
		}
		}
}