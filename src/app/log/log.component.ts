import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppConfigService } from './../config/app-config/app-config.service';
import { LogService } from './log.service';


@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {

  constructor(
    public _logService: LogService,
    public _appConfigService: AppConfigService,
    public router: Router,
  ) { }

  ngOnInit() {
  }

  setTime(time) {
    this._logService.time = time;
  }

  isTime(time) {
    return this._logService.time == time
  }

}
