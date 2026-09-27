package com.example.demo;

public class ChainedExceptionDemo {
			public static void main(String[] args) {
			try {
			try {
			int a = 10/0;
			} catch (ArithmeticException e) {
			Exception ex = new Exception("Outer Exception");
			ex.initCause(e);
			throw ex;
			}
			} catch (Exception e) {
			System.out.println("Caught:" + e.getMessage());
			System.out.println("Cause:" + e.getCause());
			}
			}
		}
	
