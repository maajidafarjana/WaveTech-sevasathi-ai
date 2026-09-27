
public class CheckedExceptionDemo {
		public static void pause() throws InterruptedException {
			Thread.sleep(1000);
			System.out.println("Completed pause.");
			}
			public static void main(String[] args) {
			try {
			pause();
			} catch (InterruptedException e) {
			System.out.println("Interrupted!");
			}
			}
		}
		