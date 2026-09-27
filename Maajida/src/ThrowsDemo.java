import java.io.IOException;

	public class ThrowsDemo {
	public static void risky() throws IOException {
	throw new IOException("IO error");
	}
	public static void main(String[] args) {
	try {
	risky();
	} catch (IOException e) {
	System.out.println("Handled IO");
	}
	}
	}