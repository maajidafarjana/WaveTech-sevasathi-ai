
public class MultipleCatchDemo {

	public static void main(String[] args) {
		try {
			int[] arr = {10,0,5};
			int c = arr[0] / arr[1];
			System.out.println(arr[5]);
			} catch (ArithmeticException e) {
			System.out.println("Arithmetic error");
			} catch (ArrayIndexOutOfBoundsException e) {
			System.out.println("Invalid index");
			}
	}
}