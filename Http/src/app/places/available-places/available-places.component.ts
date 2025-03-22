import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  effect,
} from '@angular/core';
import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private placeService = inject(PlacesService);

  ngOnInit() {
    this.isFetching.set(true);
    this.placeService.loadAvailablePlaces().subscribe({
      next: (res) => {
        console.log(res.places);
        this.places.set(res.places);
      },
      error: (err: Error) => {
        console.error(err);
        this.error.set(err.message);
      },
      complete: () => {
        this.isFetching.set(false);
      },
    });
  }

  onSelectedPlace(place: Place) {
  const subscription = this.placeService.addPlaceToUserPlaces(place).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  
}
