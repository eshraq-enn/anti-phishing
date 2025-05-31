import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailAnalysisService {
  constructor(private http: HttpClient) {}

  analyzeEmail(emailData: { subject: string; content: string }): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.post(`${environment.apiUrl}/api/email-analysis/analyze`, emailData, { headers });
  }

  analyzeEmailFile(file: File): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.apiUrl}/api/email-analysis/analyze-file`, formData, { headers });
  }

  getAnalysisHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/email-analysis/history`);
  }

  getAnalysisById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/email-analysis/${id}`);
  }

  exportToPdf(analysis: any): Observable<Blob> {
    return this.http.post(`${environment.apiUrl}/api/email-analysis/export/pdf`, analysis, {
      responseType: 'blob'
    });
  }

  exportToCsv(analysis: any): Observable<Blob> {
    return this.http.post(`${environment.apiUrl}/api/email-analysis/export/csv`, analysis, {
      responseType: 'blob'
    });
  }

  exportToPdfById(id: number): Observable<Blob> {
    return this.http.post(`${environment.apiUrl}/api/email-analysis/export/pdf/${id}`, {}, {
      responseType: 'blob'
    });
  }

  exportToCsvById(id: number): Observable<Blob> {
    return this.http.post(`${environment.apiUrl}/api/email-analysis/export/csv/${id}`, {}, {
      responseType: 'blob'
    });
  }
} 