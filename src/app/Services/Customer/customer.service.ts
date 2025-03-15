import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';


export interface Customer {
  _id: string;
  fname: string;
  lname: string;
  mname?: string;
  address?: string;
  email: string;
  customerType?: 'Senior Citizen' | 'PWD' | 'Regular';
  discountRate?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.api}/customer`  // Adjust as needed

  constructor(private http: HttpClient) { }

  
  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }
}
