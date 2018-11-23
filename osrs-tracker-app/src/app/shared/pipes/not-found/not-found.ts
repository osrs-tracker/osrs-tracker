import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'notFound',
})
export class NotFoundPipe implements PipeTransform {

    // Takes a value and returns 2nd param if value equals -1, or the default '-'
    transform(value: string, output: string) {
        return value === '-1' ? (output || '-') : value;
    }
}
