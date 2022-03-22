import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  
  private static readonly urlPattern: RegExp = new RegExp('(https?:\/\/)?([\da-z]+)\.([a-z.]{2,6})[\/\w .-]*\/?');
  public readonly CLOSE = "close";
  public readonly COPY = "copy";
  public readonly OPEN_TAB = "openTab";

  @ViewChild('qrscanner') qrscanner!: NgxScannerQrcodeComponent;
  @ViewChild('outputDialog') outputDialog!: TemplateRef<any>;

  private destroyed$: Subject<void> = new Subject();

  private output: Subject<string> = new Subject();;
  public output$: Observable<string> = this.output.asObservable();
  //public count: number = 0;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard
  ){
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
	this.clipboard.copy(result);
        if(result == this.CLOSE) {
          // don't do anything else
	} else if (result == this.COPY) {
          if(this.clipboard.copy(output)) {
            // copy successful
	  } else {
            // error during copy
	  }
	} else if (result == this.OPEN_TAB) {
          window.open(output, "_blank");
	}
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
    console.error("Error thrown in the qr scanner component:", error);
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
