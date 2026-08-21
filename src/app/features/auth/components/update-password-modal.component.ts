import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonCloseDirective,
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  RowComponent,
} from '@coreui/angular';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-update-password-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonCloseDirective,
    ButtonDirective,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    RowComponent,
    ColComponent,
  ],
  template: `
    <c-modal [visible]="visible" (visibleChange)="visibleChange.emit($event)" alignment="center">
      <c-modal-header>
        <h5 cModalTitle>Modifier le mot de passe</h5>
        <button cButtonClose (click)="close()"></button>
      </c-modal-header>
      <c-modal-body>
        <form cForm [formGroup]="form" (ngSubmit)="submit()" id="updatePasswordForm">
          <c-row class="g-3">
            <c-col md="12">
              <label cLabel for="oldPassword">Ancien mot de passe</label>
              <input
                cFormControl
                id="oldPassword"
                type="password"
                formControlName="oldPassword"
                autocomplete="current-password"
                placeholder="Entrez votre mot de passe actuel"
              />
            </c-col>
            <c-col md="12">
              <label cLabel for="newPassword">Nouveau mot de passe</label>
              <input
                cFormControl
                id="newPassword"
                type="password"
                formControlName="newPassword"
                autocomplete="new-password"
                placeholder="Entrez le nouveau mot de passe"
              />
            </c-col>
            <c-col md="12">
              <label cLabel for="confirmPassword">Confirmer le nouveau mot de passe</label>
              <input
                cFormControl
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                autocomplete="new-password"
                placeholder="Confirmez le nouveau mot de passe"
              />
              @if (form.errors?.['mismatch'] && form.get('confirmPassword')?.touched) {
                <div class="text-danger small mt-1">Les mots de passe ne correspondent pas.</div>
              }
            </c-col>
          </c-row>
        </form>
      </c-modal-body>
      <c-modal-footer>
        <button cButton color="secondary" variant="outline" type="button" (click)="close()">Annuler</button>
        <button cButton color="primary" type="submit" form="updatePasswordForm" [disabled]="busy() || form.invalid">
          {{ busy() ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </c-modal-footer>
    </c-modal>
  `
})
export class UpdatePasswordModalComponent {
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly busy = signal(false);

  readonly form = this.fb.nonNullable.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, {
    validators: (group) => {
      const pass = group.get('newPassword')?.value;
      const confirm = group.get('confirmPassword')?.value;
      return pass === confirm ? null : { mismatch: true };
    }
  });

  close(): void {
    this.visibleChange.emit(false);
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) return;

    this.busy.set(true);
    const { oldPassword, newPassword } = this.form.getRawValue();

    this.auth.updatePassword({ oldPassword, newPassword }).subscribe({
      next: (res) => {
        this.busy.set(false);
        if (res.success) {
          this.notifications.success(res.message || 'Mot de passe mis à jour avec succès');
          this.close();
        } else {
          this.notifications.error(res.message || 'Erreur lors de la mise à jour');
        }
      },
      error: (err) => {
        this.busy.set(false);
        this.notifications.error(err.error?.message || 'Erreur technique');
      }
    });
  }
}
