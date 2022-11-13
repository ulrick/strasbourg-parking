import { HttpHeaders, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs';

export class BaseService {
    protected noCacheParams(): { params: HttpParams } {
        return { params: new HttpParams().set('_', '' + (new Date().getTime())) };
    }

    protected getContentTypeOptions(contentType: string): { headers: HttpHeaders } {
        return {
            headers: new HttpHeaders({
                'Content-type': contentType
            })
        };
    }

    protected handleError(error: any) {
        console.error(error);
        return throwError(error);
    }
}
