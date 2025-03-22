import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DataService } from '../../Services/data.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-basic',
  standalone: false,
  templateUrl: './basic.component.html',
  styleUrl: './basic.component.scss'
})
export class BasicComponent implements OnInit, OnDestroy {
  users: User[] = [];
  users$: Observable<User[]>;
  latestNotification$: Observable<string>;
  simpleResults: number[] = [];
  
  private subscriptions = new Subscription();
  
  constructor(private dataService: DataService) {
    this.users$ = this.dataService.users$;
    this.latestNotification$ = this.dataService.notifications$;
  }
  
  ngOnInit(): void {
    // Subscribe to users Observable
    this.subscriptions.add(
      this.dataService.users$.subscribe(users => {
        this.users = users;
      })
    );
  }
  
  subscribeToSimpleObservable(): void {
    this.simpleResults = [];
    this.subscriptions.add(
      this.dataService.getSimpleObservable().subscribe(value => {
        this.simpleResults.push(value);
      })
    );
  }
  
  loadUsers(): void {
    this.dataService.loadUsers();
  }
  
  addUser(name: string, email: string): void {
    if (name && email) {
      const newUser: User = {
        id: this.users.length + 1,
        name,
        email,
        active: true
      };
      this.dataService.addUser(newUser);
    }
  }
  
  ngOnDestroy(): void {
    // Important: Unsubscribe to avoid memory leaks
    this.subscriptions.unsubscribe();
  }
}