import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { TicketFormService } from './ticket-form.service';
import { TicketService } from '../service/ticket.service';
import { ITicket } from '../ticket.model';
import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { ILabel } from 'app/entities/label/label.model';
import { LabelService } from 'app/entities/label/service/label.service';

import { TicketUpdateComponent } from './ticket-update.component';

describe('Ticket Management Update Component', () => {
  let comp: TicketUpdateComponent;
  let fixture: ComponentFixture<TicketUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let ticketFormService: TicketFormService;
  let ticketService: TicketService;
  let projectService: ProjectService;
  let userService: UserService;
  let labelService: LabelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [TicketUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(TicketUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TicketUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    ticketFormService = TestBed.inject(TicketFormService);
    ticketService = TestBed.inject(TicketService);
    projectService = TestBed.inject(ProjectService);
    userService = TestBed.inject(UserService);
    labelService = TestBed.inject(LabelService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Project query and add missing value', () => {
      const ticket: ITicket = { id: 456 };
      const project: IProject = { id: 3342 };
      ticket.project = project;

      const projectCollection: IProject[] = [{ id: 32088 }];
      jest.spyOn(projectService, 'query').mockReturnValue(of(new HttpResponse({ body: projectCollection })));
      const additionalProjects = [project];
      const expectedCollection: IProject[] = [...additionalProjects, ...projectCollection];
      jest.spyOn(projectService, 'addProjectToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      expect(projectService.query).toHaveBeenCalled();
      expect(projectService.addProjectToCollectionIfMissing).toHaveBeenCalledWith(
        projectCollection,
        ...additionalProjects.map(expect.objectContaining)
      );
      expect(comp.projectsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call User query and add missing value', () => {
      const ticket: ITicket = { id: 456 };
      const assignedTo: IUser = { id: 97759 };
      ticket.assignedTo = assignedTo;
      const reportedBy: IUser = { id: 21276 };
      ticket.reportedBy = reportedBy;

      const userCollection: IUser[] = [{ id: 97938 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [assignedTo, reportedBy];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining)
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Label query and add missing value', () => {
      const ticket: ITicket = { id: 456 };
      const labels: ILabel[] = [{ id: 30517 }];
      ticket.labels = labels;

      const labelCollection: ILabel[] = [{ id: 33690 }];
      jest.spyOn(labelService, 'query').mockReturnValue(of(new HttpResponse({ body: labelCollection })));
      const additionalLabels = [...labels];
      const expectedCollection: ILabel[] = [...additionalLabels, ...labelCollection];
      jest.spyOn(labelService, 'addLabelToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      expect(labelService.query).toHaveBeenCalled();
      expect(labelService.addLabelToCollectionIfMissing).toHaveBeenCalledWith(
        labelCollection,
        ...additionalLabels.map(expect.objectContaining)
      );
      expect(comp.labelsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const ticket: ITicket = { id: 456 };
      const project: IProject = { id: 1082 };
      ticket.project = project;
      const assignedTo: IUser = { id: 59613 };
      ticket.assignedTo = assignedTo;
      const reportedBy: IUser = { id: 89503 };
      ticket.reportedBy = reportedBy;
      const label: ILabel = { id: 88448 };
      ticket.labels = [label];

      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      expect(comp.projectsSharedCollection).toContain(project);
      expect(comp.usersSharedCollection).toContain(assignedTo);
      expect(comp.usersSharedCollection).toContain(reportedBy);
      expect(comp.labelsSharedCollection).toContain(label);
      expect(comp.ticket).toEqual(ticket);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITicket>>();
      const ticket = { id: 123 };
      jest.spyOn(ticketFormService, 'getTicket').mockReturnValue(ticket);
      jest.spyOn(ticketService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: ticket }));
      saveSubject.complete();

      // THEN
      expect(ticketFormService.getTicket).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(ticketService.update).toHaveBeenCalledWith(expect.objectContaining(ticket));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITicket>>();
      const ticket = { id: 123 };
      jest.spyOn(ticketFormService, 'getTicket').mockReturnValue({ id: null });
      jest.spyOn(ticketService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ticket: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: ticket }));
      saveSubject.complete();

      // THEN
      expect(ticketFormService.getTicket).toHaveBeenCalled();
      expect(ticketService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITicket>>();
      const ticket = { id: 123 };
      jest.spyOn(ticketService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(ticketService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareProject', () => {
      it('Should forward to projectService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(projectService, 'compareProject');
        comp.compareProject(entity, entity2);
        expect(projectService.compareProject).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareUser', () => {
      it('Should forward to userService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareLabel', () => {
      it('Should forward to labelService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(labelService, 'compareLabel');
        comp.compareLabel(entity, entity2);
        expect(labelService.compareLabel).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
