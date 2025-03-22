import { DestroyRef, inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Something Went Wrong!'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Something Wrong!'
    ).pipe(
      tap({
        next: (res) => {
          this.userPlaces.set(res.places);
        },
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlace = this.userPlaces();

    if (!prevPlace.some((p) => p.id === place.id)) {
      this.userPlaces.set([...prevPlace, place]);
    }

    return this.httpClient
      .put('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        catchError((error) => {
          this.userPlaces.set(prevPlace);
          return throwError(() => new Error('Something went wrong!'));
        })
      );
  }

  removeUserPlace(place: Place) {
    const prevPlace = this.userPlaces();
    if (prevPlace.some((p) => p.id === place.id)) { 
      this.userPlaces.set(prevPlace.filter((p)=> p.id !== place.id));
    }
    
    return this.httpClient
      .delete(`http://localhost:3000/user-places/${place.id}`)
      .pipe(
        catchError((error) => {
          this.userPlaces.set(prevPlace);
          return throwError(() => new Error('Something went wrong!'));
        })
      );
  }

  fetchPlaces(url: string, errorMsg: string) {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((error) => {
        console.log(error);
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}
