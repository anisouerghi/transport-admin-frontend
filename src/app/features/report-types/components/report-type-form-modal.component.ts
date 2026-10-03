import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild, inject, signal } from '@angular/core';
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
import { NotificationService } from '../../../core/services/notification.service';
import { ReportType, ReportTypeRequest } from '../models/report-type.model';
import { REPORT_TYPE_ICON_CHOICES, reportTypeIcon } from '../report-type-icons';
import { ReportTypesService } from '../services/report-types.service';

@Component({
  selector: 'app-report-type-form-modal',
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
  templateUrl: './report-type-form-modal.component.html',
  styles: [`
    .icon-picker { position: relative; }
    .icon-picker__field {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.25rem 0.35rem 0.25rem 0.6rem;
      border: 1px solid var(--cui-border-color, #d8dbe0);
      border-radius: 0.375rem;
      background: #fff;
    }
    .icon-picker__field.is-invalid {
      border-color: var(--cui-danger, #e55353);
    }
    .icon-picker__field input {
      flex: 1;
      min-width: 0;
      border: 0;
      padding: 0.2rem 0;
      background: transparent;
      box-shadow: none;
    }
    .icon-picker__field input:focus {
      outline: none;
      box-shadow: none;
    }
    .icon-picker__chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      background: transparent;
      color: #424752;
      padding: 0.15rem;
    }
    .icon-picker__hint {
      padding: 0.45rem 0.5rem;
      color: #424752;
      font-size: 0.85rem;
    }
    .icon-picker__menu {
      list-style: none;
      margin: 0.25rem 0 0;
      padding: 0.25rem;
      border: 1px solid var(--cui-border-color, #d8dbe0);
      border-radius: 0.375rem;
      background: #fff;
      max-height: 16rem;
      overflow: auto;
    }
    .icon-picker__option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      border: 0;
      background: transparent;
      text-align: start;
      padding: 0.4rem 0.5rem;
      border-radius: 0.375rem;
      color: inherit;
    }
    .icon-picker__option[aria-selected='true'],
    .icon-picker__option:hover {
      background: rgba(11, 82, 168, 0.08);
    }
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 1.5rem;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      direction: ltr;
      font-feature-settings: 'liga';
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      color: #0b52a8;
    }
  `],
})
export class ReportTypeFormModalComponent implements OnChanges {
  private readonly service = inject(ReportTypesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() item: ReportType | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  @ViewChild('iconPicker') private iconPicker?: ElementRef<HTMLElement>;

  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly iconMenuOpen = signal(false);

  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    label: ['', [Validators.required, Validators.maxLength(150)]],
    labelAr: ['', [Validators.maxLength(150)]],
    labelEn: ['', [Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(500)]],
    priority: [1, [Validators.required, Validators.min(1), Validators.max(9999)]],
    icon: ['', [Validators.required, Validators.maxLength(80), Validators.pattern(/^[a-z0-9_]+$/)]],
  });

  get isEdit(): boolean {
    return this.item != null;
  }

  ngOnChanges(): void {
    this.submitted.set(false);
    this.iconMenuOpen.set(false);
    if (this.item) {
      this.form.reset({
        code: this.item.code,
        label: this.item.labelFr || this.item.label,
        labelAr: this.item.labelAr ?? '',
        labelEn: this.item.labelEn ?? '',
        description: this.item.description ?? '',
        priority: this.item.priority ?? 1,
        icon: this.item.icon?.trim() || reportTypeIcon(this.item.code),
      });
    } else {
      this.form.reset({
        code: '',
        label: '',
        labelAr: '',
        labelEn: '',
        description: '',
        priority: 1,
        icon: '',
      });
    }
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: ReportTypeRequest = {
      code: raw.code,
      label: raw.label,
      labelAr: raw.labelAr || undefined,
      labelEn: raw.labelEn || undefined,
      description: raw.description || undefined,
      priority: Number(raw.priority),
      icon: raw.icon.trim(),
    };
    this.saving.set(true);
    const req$ =
      this.isEdit && this.item
        ? this.service.update(this.item.reportTypeId, payload)
        : this.service.create(payload);
    req$.subscribe({
      next: () => {
        this.notifications.success(this.isEdit ? 'Report type updated' : 'Report type created');
        this.saving.set(false);
        this.saved.emit();
        this.close();
      },
      error: () => this.saving.set(false),
    });
  }

  iconName(): string {
    return this.form.controls.icon.value?.trim() ?? '';
  }

  iconChoices(): string[] {
    const current = this.iconName();
    const catalog = REPORT_TYPE_ICON_CHOICES as readonly string[];
    const known = current
      ? catalog.filter((name) => name.includes(current))
      : [...catalog];
    if (current && !catalog.includes(current)) {
      return [current, ...known];
    }
    return known;
  }

  openIconMenu(): void {
    this.iconMenuOpen.set(true);
  }

  toggleIconMenu(): void {
    this.iconMenuOpen.update((open) => !open);
  }

  selectIcon(name: string): void {
    this.form.controls.icon.setValue(name);
    this.form.controls.icon.markAsTouched();
    this.iconMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  closeIconMenuOnOutsideClick(event: MouseEvent): void {
    if (!this.iconMenuOpen()) {
      return;
    }
    const root = this.iconPicker?.nativeElement;
    if (root && event.target instanceof Node && !root.contains(event.target)) {
      this.iconMenuOpen.set(false);
    }
  }

  fieldInvalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  fieldTouchedValid(name: keyof typeof this.form.controls): boolean | undefined {
    const c = this.form.controls[name];
    if (!(c.touched || this.submitted())) return undefined;
    return c.valid;
  }
}
