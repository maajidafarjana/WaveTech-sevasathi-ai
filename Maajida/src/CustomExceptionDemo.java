 class InvalidMarksException extends Exception { 
    public InvalidMarksException(String msg) { 
        super(msg); 
    } 
}
public class CustomExceptionDemo { 
    public static void checkMarks(int m) throws InvalidMarksException { 
        if(m < 0 || m > 100) 
            throw new InvalidMarksException("Marks must be 0-100"); 
        System.out.println("Valid marks"); 
    } 
 
    public static void main(String[] args) { 
        try { 
            checkMarks(150); 
        } catch (InvalidMarksException e) { 
            System.out.println("Caught: " + e.getMessage()); 
        } 
    } 
}