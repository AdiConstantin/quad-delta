import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsPageComponent } from './products/products-page.component';
import { AuditPageComponent } from './audit/audit-page.component';

const routes: Routes = [
  { path: '', component: ProductsPageComponent },
  { path: 'audit', component: AuditPageComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
