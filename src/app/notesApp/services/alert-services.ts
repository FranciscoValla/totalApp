import { Service, signal } from '@angular/core';

export interface AlertInterface {
  type: string;
  txt: string;
}

@Service()
export class AlertServices {
  currentAlert = signal<AlertInterface | null> (null);
  alertShow = signal<boolean>(false);

  showAlert(alert: AlertInterface) {
    this.currentAlert.set(alert);
    this.alertShow.set(true);

    setTimeout(() => {
      this.alertShow.set(false);
      this.currentAlert.set(null);
    }, 5000);
  }
}
