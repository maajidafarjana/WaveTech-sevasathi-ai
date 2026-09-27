package com.pack;

public class ExceptionDemo {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
      
     try {int arr[]= {1,2,3};
     System.out.println(arr[2]);}
     catch(ArithmeticException e) {
    	 System.out.println("sum exception");
     }
     catch(ArrayIndexOutOfBoundsException e) {
    	 System.out.println("Array exception");
     }
      System.out.println("printing the exception demo");
	}

}
