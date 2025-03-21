import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBed, faBowlFood, faHotel, faList, faToiletPaper } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-maintenance-landing',
  imports: [ RouterLink,FontAwesomeModule ],
  templateUrl: './maintenance-landing.component.html',
  styleUrl: './maintenance-landing.component.css'
})
export class MaintenanceLandingComponent {
  //icons
  hotelIcon = faHotel;
  bedIcon = faBed;
  foodIcon = faBowlFood
  houseKeeping = faToiletPaper ;
  category = faList;
}
