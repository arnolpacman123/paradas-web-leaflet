import { Component, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnDestroy {
  isSmallScreen = false;
  private subscription!: Subscription;

  constructor(breakpointObserver: BreakpointObserver) {
    this.subscription = breakpointObserver.observe([
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
