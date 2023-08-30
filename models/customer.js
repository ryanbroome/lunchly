/** Customer for Lunchly */
// TODO Mentor Q - It seems like I should use some .toLowerCase() or .toUpperCase() // _lodash methods
//? Thought was to save it, updated, compare it to db as lowercase, display to user as capitalize first letter only.
// ?Seems like this would be a problem or just annoying if you search a customer by name and don't use correct capitalization would be annoying to user.
//? What would recommend approach be?

// TODO Getter Setter for: notes use hidden _notes property ensure if someone tries to set a falsy value to a customers notes the value instead gets assigned to an empty string/
// TODO G for: fullName into a getter
// TODO G/S numGuests on a reservation, such that the setter throws an error if you try to make a reservation for fewer than 1 person
// TODO G/S startAt on a reservation, so that you must set the start date to a value that is a Date object
// TODO G/S customerId on a reservation, such that once a resrvation is assigned a customerId, that key can never be assigned to a new value (attempts should throw an error)
// TODO Mentor Q - Discuss other ways to exploit the getter / setter pattern

const db = require("../db");
const Reservation = require("./reservation");
const _ = require("lodash");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = firstName + " " + lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map((c) => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get a customer by NAME. */

  static async getByName(sFirstName, sLastName) {
    const results = await db.query(
      `SELECT id, 
       first_name AS "firstName",  
       last_name AS "lastName", 
       phone, 
       notes 
      FROM customers 
      WHERE (first_name = $1) AND (last_name = $2)`,
      [sFirstName, sLastName]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${sFirstName} ${sLastName}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
