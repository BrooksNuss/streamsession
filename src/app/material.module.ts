import { NgModule } from '@angular/core';

import {
  MdButtonModule,
  MdMenuModule,
  MdToolbarModule,
  MdIconModule,
  MdCardModule,
  MdSliderModule,
  MdInputModule,
  MdGridListModule,
  MdTabsModule,
  
} from '@angular/material';

@NgModule({
  imports: [
    MdButtonModule,
    MdMenuModule,
    MdToolbarModule,
    MdIconModule,
    MdCardModule,
    MdSliderModule,
    MdInputModule,
    MdGridListModule,
    MdTabsModule,
  ],
  exports: [
    MdButtonModule,
    MdMenuModule,
    MdToolbarModule,
    MdIconModule,
    MdCardModule,
    MdSliderModule,
    MdInputModule,
    MdGridListModule,
    MdTabsModule,
  ]
})
export class MaterialModule {}