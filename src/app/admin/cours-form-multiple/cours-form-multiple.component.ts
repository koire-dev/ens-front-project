import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { api as apiConfig } from '../../core/configs/constants';
import { read, utils } from 'xlsx';
import { ServicesService } from '../../core/services/services.service';
import { Credit } from '../../core/models/credit';
import { Departement } from '../../core/models/departement';
import { Parcours } from '../../core/models/parcours';
import { Semestre } from '../../core/models/semestre';
import { TypeCours } from '../../core/models/typeCours';

import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-cours-form-multiple',
  templateUrl: './cours-form-multiple.component.html',
  styleUrls: ['./cours-form-multiple.component.css']
})
export class CoursFormMultipleComponent implements OnInit {

  cours: any;
  coursJson: any = [];
  departements!: Departement[];
  parcours!: Parcours[];
  credit!: Credit[];
  typeCours!: TypeCours[];
  semestre!: Semestre[];
  submitted = false;
  userId: any;
  file?: File;

  form!: FormGroup
  public errorMessages = {
    required: 'Ce champ est requis.',
    email: 'Format de l\'email invalide.',
    minlength: 'Ce champ doit contenir au moins {{ requiredLength }} caractères.',
  };

  constructor(
   private notification:NotificationService,
    private AdminService: ServicesService) { }

  ngOnInit(): void {
    this.onForm();
    this.getAllCredits();
    this.getAllDepartements();
    this.getAllParcours();
    this.getAllTypesCours();
    this.getSemestres();
  }

  onForm() {
    this.form = new FormGroup({
      departement: new FormControl('', [Validators.required]),
      // parcours: new FormControl('', [Validators.required]),
      // credit: new FormControl('', [Validators.required]),
      // typeCours: new FormControl('', [Validators.required]),
      // semestre: new FormControl('', [Validators.required]),
      
    })
  }


  getAllParcours() {
    this.parcours = [];
    const url = `${apiConfig.admin.parcours.getAll}`;
    this.AdminService.getResources(url).subscribe(
      (data) => {
        this.parcours = data.body;
      },
      (err) => {
        console.log('erreur', err.error.message);
      }
    );
  }


  getAllDepartements() {
    this.departements = [];
    const url = `${apiConfig.admin.departement.getAll}`;
    this.AdminService.getResources(url).subscribe(
      (data) => {
        this.departements = data.body;
      },
      (err) => {
        console.log('erreur', err.error.message);
      }
    );
  }


  getAllCredits() {
    this.credit = [];
    const url = `${apiConfig.admin.credit.getAll}`;
    this.AdminService.getResources(url).subscribe(
      (data) => {
        this.credit = data.body;
      },
      (err) => {
        console.log('erreur', err.error.message);
      }
    );
  }


  getAllTypesCours() {
    this.typeCours = [];
    const url = `${apiConfig.admin.typeCours.getAll}`;
    this.AdminService.getResources(url).subscribe(
      (data) => {
        this.typeCours = data.body;
      },
      (err) => {
        console.log('erreur', err.error.message);
      }
    );
  }

  onSelectFile(events: any) {
    if (events.target.files && events.target.files[0]) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(events.target.files[0]);
      reader.onload = (e) => {
        const data = e?.target?.result;
        const workbook = read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        let json = utils.sheet_to_json(worksheet);
        this.coursJson = json
        // console.log(json);
        //this.json = json;
      };

    }
  }


  uploadFileData() {
    this.submitted = true;


    const propertiesArray = ['code', 'natureUE', 'intitule', 'typeCours', 'credit', 'semestre'];
    this.coursJson.forEach((item: any) => {
      // console.log(Object.keys(item).toString().toLowerCase());
      const keys = Object.keys(item);
      const convertedObject: any = {};
      for (const key of keys) {
        convertedObject[key.toLowerCase()] = item[key];
      }
      for (const prop of keys) {
        if (propertiesArray.includes(prop.toLowerCase())) {
          var cours: any = {
            code: convertedObject.code,
            natureUE: convertedObject.natureue,
            intitule: convertedObject.intitule,
            departement: this.findDepartementById(Number(this.form.value.departement)),
            credit: this.findCreditById(Number(convertedObject.credit)),
            typecours: this.findTypeCoursByName(convertedObject.typecours.toString()),
            semestre: this.findSemestreById(Number(convertedObject.semestre)),
          }

        }
      }
      // Save datas from files in database
      const url = `${apiConfig.admin.cours.create}`;
      this.AdminService.saveResource(url, cours).subscribe(
        {
          next: () => {
            this.notification.record()
            this.form.reset();
          },
          error: () => {
            this.notification.error()
 

          }
        }
      );
    })

  }


  findTypeCoursByName(id: String) {
    return this.typeCours.find(item => id === item.nom)
  }

  findDepartementById(id: Number) {
    return this.departements.find(item => id === item.id)
  }


  findCreditById(credit: Number) {
    return this.credit.find(item => credit === item.valeur)
  }

  findSemestreById(semestre: Number) {
    return this.semestre.find(item => semestre === item.valeur)
  }

  findParcoursById(id: Number) {
    return this.parcours.find(item => id === item.id)
  }

  getSemestres() {
    const url = `${apiConfig.admin.semestre.getAll}`;
    this.AdminService.getResources(url).subscribe(
      (data) => {
        this.semestre = data.body;
      },
      (err) => {
        console.log('erreur', err.error.message);
      }
    );
  }


}
