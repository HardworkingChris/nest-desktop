import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { environment } from '../../environments/environment';

import { NestServerService } from '../nest-server/nest-server.service';
import { ModelConfigService } from './model-config/model-config.service';
import { DBService } from '../services/db/db.service';


@Injectable({
  providedIn: 'root'
})
export class ModelService {
  public db: any;
  public params: string = 'list';
  public elementType: string;
  public enabledModel: boolean = false;
  public models: any = {};
  public selectedModel: string = '';
  public status: any = {
    ready: false,
    valid: false,
  };
  public update: EventEmitter<any> = new EventEmitter();
  public url: string = 'view';
  public version: string;
  public defaults: any = {};
  public progress: boolean = false;
  public editing: boolean = false;

  constructor(
    private _nestServerService: NestServerService,
    private _modelConfigService: ModelConfigService,
    private _dbService: DBService,
    private http: HttpClient,
  ) {
  }

  init() {
    this.status.ready = false;
    var config = this._modelConfigService.config['db'];
    this.db = this._dbService.init('model', config);
    this.initVersion()
    this.count().then(count => {
      if (count == 0) {
        var files = [
          'ac_generator',
          'dc_generator',
          'hh_psc_alpha',
          'iaf_cond_alpha',
          'iaf_psc_alpha',
          'multimeter',
          'noise_generator',
          'parrot_neuron',
          'poisson_generator',
          'spike_detector',
          'spike_generator',
          'static_synapse',
          'step_current_generator',
          'voltmeter'
        ];
        this.fromFiles(files)
        this.status.valid = true;
        this.status.ready = true;
      } else {
        this._dbService.db.list(this.db).then(models => {
          models.map(model => this.models[model.id] = model)
          this.isValid(models.length);
        })
      }
    })
  }

  fromFiles(files) {
    var modelFiles = files.map(file => this.http.get('/assets/models/' + file + '.json'))
    forkJoin(modelFiles).subscribe(models => {
      models.map(model => {
        this.models[model['id']] = model;
        model['version'] = environment.VERSION;
        this._dbService.db.create(this.db, model)
      })
    })
  }

  list(elementType = null, sort = true) {
    var models = Object.keys(this.models);
    if (elementType) {
      models = models.filter(id => {
        var model = this.models[id];
        return model['element_type'] == elementType
      });
    }
    if (sort) {
      models.sort()
    }
    return models
  }

  requestModelDefaults(model) {
    var urlRoot = this._nestServerService.url();
    var data = {
      'model': model,
    };
    this.defaults = {};
    this.progress = true;
    setTimeout(() => {
      this.http.post(urlRoot + '/api/nest/GetDefaults', data)
        .subscribe(data => {
          this.progress = false;
          this.defaults = data['response']['data'];
        })
    }, 500)
  }

  selectModel(model) {
    this.selectedModel = model;
    this.enabledModel = this.hasModel(model);
    this.requestModelDefaults(model);
  }

  hasModel(model = null) {
    model = model || this.selectedModel;
    return this.list().includes(model);
  }

  config(model = null) {
    return this.models[model || this.selectedModel];
  }

  count() {
    return this._dbService.db.count(this.db)
  }

  save(config) {
    return this._dbService.db.create(this.db, config)
  }

  load() {
    return this._dbService.db.count(this.db).then(count => {
      if (count == 0) {
        this.init()
        setTimeout(() => this.load(), 1000)
      } else {
        this._dbService.db.list(this.db).then(models => this.models = models)
      }
    })
  }

  delete(id) {
    return this._dbService.db.delete(this.db, id)
  }

  reset() {
    this.db.destroy().then(() => {
      this.init()
    })
  }

  initVersion() {
    this._dbService.db.getVersion(this.db)
      .catch(() => this._dbService.db.setVersion(this.db, environment.VERSION)
        .then(version => this.version = version)
      ).then(version => this.version = version)
  }

  isValid(count) {
    if (count == 0) {
      this.status.valid = true;
    } else {
      var appVersion = environment.VERSION.split('.');
      var dbVersion = this.version.split('.');
      this.status.valid = appVersion[0] == dbVersion[0] && appVersion[1] == dbVersion[1];
    }
    this.status.ready = true;
  }
}
