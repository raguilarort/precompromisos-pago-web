import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrarCatalogo',
})
export class FiltrarCatalogoPipe implements PipeTransform {
  // Recibe: El catálogo completo, el nombre de la propiedad foránea (ej. 'idClave'), y el valor actual del padre
  transform(items: any[], foreignKey: string, parentId: any): any[] {
    if (!items || !parentId) return [];
    return items.filter(item => item[foreignKey] === parentId);
  }
}
