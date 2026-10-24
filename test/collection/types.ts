/** A case of the language specification, or a group of cases. */
export type Source = Case | Group;

export type Group = {
  group: string;
  sources: Source[];
};

export type Case = {
  title: string;
  code?: string;
  inputs?: (string | number)[];
  output?: string;
  errorId?: string;
  errorParam?: {
    line?: number;
    variable?: string;
    //the word of join in the program's language, which a listAsText names
    join?: string;
  };
  todo?: string;
  skip?: string;
};
