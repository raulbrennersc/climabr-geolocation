import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { take } from 'rxjs/operators';
import { City } from 'src/domain/entities/city';
import { SearchCityService } from 'src/domain/services/search-city.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  cities: City[];
  hasError: boolean = false;
  errorMessage: string;

  constructor(
    private readonly searchService: SearchCityService,
    private readonly router: Router,
    private readonly geolocationServcei: GeolocationService,
  ) {
  }

  async onSearch(query: string) {
    try {
      this.hasError = false;
      this.cities = await this.searchService.search(query);
    } catch (error) {
      this.hasError = true;
      this.errorMessage = error.message;
    }
  }


  onSelectCity(cityId: string) {
    this.router.navigateByUrl(`/weather/${cityId}`);
  }

  onUseGeolocation() {
    this.geolocationServcei.pipe(take(1)).subscribe(geo => {
      this.searchService.getByCoordinates(geo.coords.latitude, geo.coords.longitude)
        .then(city => {
          if (!city) {
            this.hasError = true;
            this.errorMessage = 'Parece que você está muito distante de qualquer cidade que podemos detectar.';

          } else {
            this.onSelectCity(city.id.toString())
          }
        })
    }, () => {
      this.hasError = true;
      this.errorMessage = 'Você precisa permitir a utilização da geolocalização no seu dispositivo.';
    })
  }
}
