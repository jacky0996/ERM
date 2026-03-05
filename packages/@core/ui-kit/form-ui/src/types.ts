import type { FieldOptions, FormContext, GenericObject } from 'vee-validate';
import type { ZodTypeAny } from 'zod';

import type { Component, HtmlHTMLAttributes, Ref } from 'vue';

import type { VbenButtonProps } from '@vben-core/shadcn-ui';
import type { ClassType, MaybeComputedRef } from '@vben-core/typings';

import type { FormApi } from './form-api';

export type FormLayout = 'horizontal' | 'inline' | 'vertical';

export type BaseFormComponentType =
  | 'DefaultButton'
  | 'PrimaryButton'
  | 'VbenCheckbox'
  | 'VbenInput'
  | 'VbenInputPassword'
  | 'VbenPinInput'
  | 'VbenSelect'
  | (Record<never, never> & string);

type Breakpoints = '2xl:' | '3xl:' | '' | 'lg:' | 'md:' | 'sm:' | 'xl:';

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export type WrapperClassType =
  | `${Breakpoints}grid-cols-${GridCols}`
  | (Record<never, never> & string);

export type FormItemClassType =
  | `${Breakpoints}cols-end-${'auto' | GridCols}`
  | `${Breakpoints}cols-span-${'auto' | 'full' | GridCols}`
  | `${Breakpoints}cols-start-${'auto' | GridCols}`
  | (Record<never, never> & string)
  | WrapperClassType;

export type FormFieldOptions = Partial<
  FieldOptions & {
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
    validateOnInput?: boolean;
    validateOnModelUpdate?: boolean;
  }
>;

export interface FormShape {
  /** 預設值 */
  default?: any;
  /** 欄位名稱 */
  fieldName: string;
  /** 是否必填 */
  required?: boolean;
  rules?: ZodTypeAny;
}

export type MaybeComponentPropKey =
  | 'options'
  | 'placeholder'
  | 'title'
  | keyof HtmlHTMLAttributes
  | (Record<never, never> & string);

export type MaybeComponentProps = { [K in MaybeComponentPropKey]?: any };

export type FormActions = FormContext<GenericObject>;

export type CustomRenderType = (() => Component | string) | string;

export type FormSchemaRuleType =
  | 'required'
  | 'selectRequired'
  | null
  | (Record<never, never> & string)
  | ZodTypeAny;

type FormItemDependenciesCondition<T = boolean | PromiseLike<boolean>> = (
  value: Partial<Record<string, any>>,
  actions: FormActions,
) => T;

type FormItemDependenciesConditionWithRules = (
  value: Partial<Record<string, any>>,
  actions: FormActions,
) => FormSchemaRuleType | PromiseLike<FormSchemaRuleType>;

type FormItemDependenciesConditionWithProps = (
  value: Partial<Record<string, any>>,
  actions: FormActions,
) => MaybeComponentProps | PromiseLike<MaybeComponentProps>;

export interface FormItemDependencies {
  /**
   * 組件參數
   * @returns 組件參數
   */
  componentProps?: FormItemDependenciesConditionWithProps;
  /**
   * 是否禁用
   * @returns 是否禁用
   */
  disabled?: boolean | FormItemDependenciesCondition;
  /**
   * 是否渲染（刪除 DOM）
   * @returns 是否渲染
   */
  if?: boolean | FormItemDependenciesCondition;
  /**
   * 是否必填
   * @returns 是否必填
   */
  required?: FormItemDependenciesCondition;
  /**
   * 欄位規則
   */
  rules?: FormItemDependenciesConditionWithRules;
  /**
   * 是否隱藏 (CSS)
   * @returns 是否隱藏
   */
  show?: boolean | FormItemDependenciesCondition;
  /**
   * 任意觸發都會執行
   */
  trigger?: FormItemDependenciesCondition<void>;
  /**
   * 觸發欄位
   */
  triggerFields: string[];
}

type ComponentProps =
  | ((
      value: Partial<Record<string, any>>,
      actions: FormActions,
    ) => MaybeComponentProps)
  | MaybeComponentProps;

export interface FormCommonConfig {
  /**
   * 在 Label 後顯示一個冒號
   */
  colon?: boolean;
  /**
   * 所有表單項的 props
   */
  componentProps?: ComponentProps;
  /**
   * 所有表單項的控制項樣式
   */
  controlClass?: string;
  /**
   * 所有表單項的禁用狀態
   * @default false
   */
  disabled?: boolean;
  /**
   * 是否禁用所有表單項的 change 事件監聽
   * @default true
   */
  disabledOnChangeListener?: boolean;
  /**
   * 是否禁用所有表單項的 input 事件監聽
   * @default true
   */
  disabledOnInputListener?: boolean;
  /**
   * 所有表單項的空狀態值,預設都是 undefined，naive-ui 的空狀態值是 null
   */
  emptyStateValue?: null | undefined;
  /**
   * 所有表單項的控制項樣式
   * @default {}
   */
  formFieldProps?: FormFieldOptions;
  /**
   * 所有表單項的網格佈局，支援函式形式
   * @default ""
   */
  formItemClass?: (() => string) | string;
  /**
   * 隱藏所有表單項 label
   * @default false
   */
  hideLabel?: boolean;
  /**
   * 是否隱藏必填標記
   * @default false
   */
  hideRequiredMark?: boolean;
  /**
   * 所有表單項的 label 樣式
   * @default ""
   */
  labelClass?: string;
  /**
   * 所有表單項的 label 寬度
   */
  labelWidth?: number;
  /**
   * 所有表單項的 model 屬性名
   * @default "modelValue"
   */
  modelPropName?: string;
  /**
   * 所有表單項的 wrapper 樣式
   */
  wrapperClass?: string;
}

type RenderComponentContentType = (
  value: Partial<Record<string, any>>,
  api: FormActions,
) => Record<string, any>;

export type HandleSubmitFn = (
  values: Record<string, any>,
) => Promise<void> | void;

export type HandleResetFn = (
  values: Record<string, any>,
) => Promise<void> | void;

export type FieldMappingTime = [
  string,
  [string, string],
  (
    | ((value: any, fieldName: string) => any)
    | [string, string]
    | null
    | string
  )?,
 ][];

export type ArrayToStringFields = Array<
  | [string[], string?] // 嵌套陣列格式，可選分隔符
  | string // 單個欄位，使用預設分隔符
  | string[] // 簡單陣列格式，最後一個元素可以是分隔符
>;

export interface FormSchema<
  T extends BaseFormComponentType = BaseFormComponentType,
> extends FormCommonConfig {
  /** 組件 */
  component: Component | T;
  /** 組件參數 */
  componentProps?: ComponentProps;
  /** 預設值 */
  defaultValue?: any;
  /** 相依性 */
  dependencies?: FormItemDependencies;
  /** 描述 */
  description?: CustomRenderType;
  /** 欄位名稱 */
  fieldName: string;
  /** 幫助資訊 */
  help?: CustomRenderType;
  /** 是否隱藏表單項 */
  hide?: boolean;
  /** 表單項 */
  label?: CustomRenderType;
  // 自定義組件內部渲染
  renderComponentContent?: RenderComponentContentType;
  /** 欄位規則 */
  rules?: FormSchemaRuleType;
  /** 後綴 */
  suffix?: CustomRenderType;
}

export interface FormFieldProps extends FormSchema {
  required?: boolean;
}

export interface FormRenderProps<
  T extends BaseFormComponentType = BaseFormComponentType,
> {
  /**
   * 表單欄位陣列映射字串設定 預設使用 ","
   */
  arrayToStringFields?: ArrayToStringFields;
  /**
   * 是否折疊，在 showCollapseButton=true 下生效
   * true:折疊 false:展開
   */
  collapsed?: boolean;
  /**
   * 折疊時保持行數
   * @default 1
   */
  collapsedRows?: number;
  /**
   * 是否觸發 resize 事件
   * @default false
   */
  collapseTriggerResize?: boolean;
  /**
   * 表單項通用後備設定，當子專案沒設定時使用這裡的設定，子專案設定優先級高於此設定
   */
  commonConfig?: FormCommonConfig;
  /**
   * 緊湊模式（移除表單每一項底部為校驗資訊預留的空間）
   */
  compact?: boolean;
  /**
   * 組件 v-model 事件綁定
   */
  componentBindEventMap?: Partial<Record<BaseFormComponentType, string>>;
  /**
   * 組件集合
   */
  componentMap: Record<BaseFormComponentType, Component>;
  /**
   * 表單欄位映射到時間格式
   */
  fieldMappingTime?: FieldMappingTime;
  /**
   * 表單實例
   */
  form?: FormContext<GenericObject>;
  /**
   * 表單項佈局
   */
  layout?: FormLayout;
  /**
   * 表單定義
   */
  schema?: FormSchema<T>[];

  /**
   * 是否顯示展開/折疊
   */
  showCollapseButton?: boolean;
  /**
   * 格式化日期
   */

  /**
   * 表單網格佈局
   * @default "grid-cols-1"
   */
  wrapperClass?: WrapperClassType;
}

export interface ActionButtonOptions extends VbenButtonProps {
  [key: string]: any;
  content?: MaybeComputedRef<string>;
  show?: boolean;
}

export interface VbenFormProps<
  T extends BaseFormComponentType = BaseFormComponentType,
 > extends Omit<
  FormRenderProps<T>,
  'componentBindEventMap' | 'componentMap' | 'form'
> {
  /**
   * 操作按鈕是否反省（提交按鈕前置）
   */
  actionButtonsReverse?: boolean;
  /**
   * 操作按鈕組的樣式
   * newLine: 在新行顯示。rowEnd: 在行內顯示，靠右對齊（預設）。inline: 使用 grid 預設樣式
   */
  actionLayout?: 'inline' | 'newLine' | 'rowEnd';
  /**
   * 操作按鈕組顯示位置，預設靠右顯示
   */
  actionPosition?: 'center' | 'left' | 'right';
  /**
   * 表單操作區域 class
   */
  actionWrapperClass?: ClassType;
  /**
   * 表單欄位陣列映射字串設定 預設使用 ","
   */
  arrayToStringFields?: ArrayToStringFields;

  /**
   * 表單欄位映射
   */
  fieldMappingTime?: FieldMappingTime;
  /**
   * 表單收起展開狀態變化回調
   */
  handleCollapsedChange?: (collapsed: boolean) => void;
  /**
   * 表單重置回調
   */
  handleReset?: HandleResetFn;
  /**
   * 表單提交回調
   */
  handleSubmit?: HandleSubmitFn;
  /**
   * 表單值變化回調
   */
  handleValuesChange?: (
    values: Record<string, any>,
    fieldsChanged: string[],
  ) => void;
  /**
   * 重置按鈕參數
   */
  resetButtonOptions?: ActionButtonOptions;

  /**
   * 驗證失敗時是否自動捲動到第一個錯誤欄位
   * @default false
   */
  scrollToFirstError?: boolean;

  /**
   * 是否顯示預設操作按鈕
   * @default true
   */
  showDefaultActions?: boolean;

  /**
   * 提交按鈕參數
   */
  submitButtonOptions?: ActionButtonOptions;

  /**
   * 是否在欄位值改變時提交表單
   * @default false
   */
  submitOnChange?: boolean;

  /**
   * 是否在回車時提交表單
   * @default false
   */
  submitOnEnter?: boolean;
}

export type ExtendedFormApi = FormApi & {
  useStore: <T = NoInfer<VbenFormProps>>(
    selector?: (state: NoInfer<VbenFormProps>) => T,
  ) => Readonly<Ref<T>>;
};

export interface VbenFormAdapterOptions<
  T extends BaseFormComponentType = BaseFormComponentType,
> {
  config?: {
    baseModelPropName?: string;
    disabledOnChangeListener?: boolean;
    disabledOnInputListener?: boolean;
    emptyStateValue?: null | undefined;
    modelPropNameMap?: Partial<Record<T, string>>;
  };
  defineRules?: {
    required?: (
      value: any,
      params: any,
      ctx: Record<string, any>,
    ) => boolean | string;
    selectRequired?: (
      value: any,
      params: any,
      ctx: Record<string, any>,
    ) => boolean | string;
  };
}
