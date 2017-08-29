import { ConfigService } from './config.service';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

@Injectable()
export class AuthorizationInterceptor implements HttpInterceptor {

    constructor(public configService: ConfigService) { }
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        // Get the auth header from the service.
        const authHeader = this.configService.getAuthHeader();
        // Clone the request to add the new header.
        const authReq = req.clone({ headers: req.headers.set('Authorization', authHeader) });
        // Pass on the cloned request instead of the original request.
        return next.handle(authReq);
    }
}