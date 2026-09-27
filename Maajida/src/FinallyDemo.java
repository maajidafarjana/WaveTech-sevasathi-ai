
public class FinallyDemo {
		public static void main(String[] args) {
		try {
		int a = 10/0;
		} catch (Exception e) {
		System.out.println("Error");
		} finally {
		System.out.println("Always executed");
		}
		}
		}