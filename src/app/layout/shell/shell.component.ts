import { Component, OnDestroy, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, MatIconModule, MatButtonModule, SidebarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnDestroy {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = signal(false);

  private readonly subscription: Subscription;

  constructor() {
    this.subscription = this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, Breakpoints.TabletPortrait])
      .subscribe((result) => this.isMobile.set(result.matches));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
