import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  
  private static readonly urlPattern: RegExp = new RegExp('(https?:\/\/)?([\da-z]+)\.([a-z.]{2,6})[\/\w .-]*\/?');
  private readonly knownLanguages: string[] = ['de', 'en'];

  @ViewChild('qrscanner') qrscanner!: NgxScannerQrcodeComponent;
  @ViewChild('outputDialog') outputDialog!: TemplateRef<any>;

  private destroyed$: Subject<void> = new Subject();

  private output: Subject<string> = new Subject();;
  public output$: Observable<string> = this.output.asObservable();
  public lang?: string;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard,
    private translate: TranslateService
  ){
    this.translate.addLangs(this.knownLanguages);
    this.translate.setDefaultLang('en');
    const browserLang = this.translate.getBrowserLang();
    if (browserLang && this.knownLanguages.includes(browserLang)) {
      this.translate.use(browserLang);
    } else {
      this.translate.use('en');
    }
    this.lang = navigator.language;

    this.output$.pipe(takeUntil(this.destroyed$)).subscribe((output: string) => {
      this.qrscanner.toggleCamera();
      const dialogRef = this.dialog.open(this.outputDialog, 
        { 
          data :
          {
            output,
            isUrl: AppComponent.isWebsite(output)
          },
          width: '95%',
	  height: '90%'
      });
      dialogRef.afterClosed().subscribe((result: string) => {
        this.qrscanner.toggleCamera();
      });
    });

  }

  ngOnInit() {
    setTimeout(() => {
      this.qrscanner.toggleCamera();
    }, 100);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public readScannerData(data: string):void {
    if (data) {
      this.output.next(data);
    }
  }

  public scannerError(error: any):void {
    if (error == 'No camera detected!') {
      console.error("Open this website on a device with a camera!");
      return;
    } else {
      console.error("Error thrown in the qr scanner component:", error);
    }
  }

  public toggleCamera():void {
    this.qrscanner.toggleCamera();
  }

  public copyToClipboard(str: string):void {
    if (this.clipboard.copy(str)) {
      this.snackBar.open('Copied to clipboard');
    } else {
      this.snackBar.open('Error while copying to clipboard');
    }
  }

  public openInTab(url: string):void {
    window.open(url, '_blank');
  }

  public static isWebsite(str: string):boolean {
    return AppComponent.urlPattern.test(str);
  }
}
