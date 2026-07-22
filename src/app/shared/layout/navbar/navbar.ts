import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Nuevas importaciones
import { Auth } from '../../../core/auth/auth';
// Importamos el nuevo componente aislado para la seleccion de ejercicios
import { SelectorEjercicio } from '../../components/selector-ejercicio/selector-ejercicio';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, SelectorEjercicio],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(Auth);
}
