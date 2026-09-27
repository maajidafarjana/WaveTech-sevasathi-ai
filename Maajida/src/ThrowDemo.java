public class ThrowDemo {
public static void checkAge(int age) {
if(age < 18) {
throw new ArithmeticException("Underage");
}
System.out.println("Eligible");
}
public static void main(String[] args) {
try {
checkAge(16);
} catch (ArithmeticException e) {
System.out.println("Caught:" + e.getMessage());
}
}
}