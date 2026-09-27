package com.pack;

import java.util.Scanner;

class TrafficFine {
    String vehicleNumber;
    String violation;
    int fineAmount;
    boolean paid;

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        TrafficFine tf = new TrafficFine();

        System.out.print("Enter Vehicle Number: ");
        tf.vehicleNumber = sc.nextLine();

        System.out.print("Enter Violation: ");
        tf.violation = sc.nextLine();

        System.out.print("Enter Fine Amount: ");
        tf.fineAmount = sc.nextInt();

        tf.paid = false;

        System.out.println("\n--- Traffic Fine Details ---");
        System.out.println("Vehicle Number: " + tf.vehicleNumber);
        System.out.println("Violation: " + tf.violation);
        System.out.println("Fine Amount: " + tf.fineAmount);
        System.out.println("Payment Status: Not Paid");

        System.out.print("\nEnter 1 to pay fine: ");
        int choice = sc.nextInt();

        if (choice == 1) {
            tf.paid = true;
            System.out.println("Payment Successful");
        }

        System.out.println("Final Payment Status: " + (tf.paid ? "Paid" : "Not Paid"));
    }
}