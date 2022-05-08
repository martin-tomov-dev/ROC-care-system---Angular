export interface IPageData {
  title: string;
  count?:number;
  loaded?: boolean;
  breadcrumbs?: IBreadcrumb[];
  fullFilled?: boolean;
}

export interface IBreadcrumb {
  title: string;
  route?: string;
}
