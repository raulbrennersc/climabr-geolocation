import { City } from '../entities/city';
import { CityNotFoundError } from '../errors/city-not-found.error';
import { CityRepository } from './protocols/city-repository';

function calcDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);  // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

export class SearchCityService {
  constructor(private readonly cityRepo: CityRepository) { }

  async search(query: string): Promise<City[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    const cities = await this.cityRepo.getAll();

    const filteredCities = cities.filter(
      (item) => item.name.toLowerCase().indexOf(query.toLowerCase()) > -1
    );

    if (filteredCities.length == 0) {
      throw new CityNotFoundError();
    }

    return filteredCities;
  }

  async getByCoordinates(latitude: number, longitude: number): Promise<City> {
    const cities = await this.cityRepo.getAll();
    let finalCity: City;
    let finalDistance = 300;
    cities.forEach(city => {
      const distance = calcDistance(latitude, longitude, city.coord.latitude, city.coord.longitude)
      if (distance < finalDistance) {
        finalDistance = distance;
        finalCity = city;
      }
    })
    return finalCity;
  }
}
