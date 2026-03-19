parser grammar KqlManagement;

managementCommandExpression
  : DOT Name=managementCommandName (Body=managementCommandBody)?
  ;

managementCommandBody
  : TableWithSchema=managementTableWithSchemaBody
  | DropTable=managementDropTableBody
  | TableTarget=managementTableTargetBody
  | Show=managementShowBody
  | IngestInline=managementIngestInlineBody
  | IngestFromUri=managementIngestFromUriBody
  | Generic=managementGenericBody
  ;

managementTableWithSchemaBody
  : TABLE TableName=managementCommandIdentifier OPENPAREN Schema=managementSchemaText CLOSEPAREN TrailingSemicolon=SEMICOLON?
  ;

managementSchemaText
  : Tokens+=managementSchemaToken*
  ;

managementSchemaToken
  : ~(CLOSEPAREN | EOF)
  ;

managementTableTargetBody
  : TABLE TableName=managementCommandIdentifier Tokens+=managementCommandToken*
  ;

managementDropTableBody
  : TABLE TableName=managementCommandIdentifier IfExists=managementCommandIdentifier?
  ;

managementShowBody
  : managementCommandIdentifier
  | DATABASE
  ;

managementIngestInlineBody
  : InlineKeyword=managementCommandIdentifier INTO TABLE TableName=managementCommandIdentifier (WITH OPENPAREN Properties=managementIngestInlineProperties CLOSEPAREN)? LESSTHAN BAR Payload=managementFromQueryPayload
  ;

managementIngestFromUriBody
  : INTO TABLE TableName=managementCommandIdentifier OPENPAREN Source=managementIngestSourceText CLOSEPAREN (WITH OPENPAREN Properties=managementIngestInlineProperties CLOSEPAREN)?
  ;

managementIngestInlineProperties
  : Tokens+=managementIngestInlinePropertyToken*
  ;

managementIngestInlinePropertyToken
  : ~(CLOSEPAREN | EOF)
  ;

managementIngestSourceText
  : Tokens+=managementIngestSourceToken*
  ;

managementIngestSourceToken
  : ~(CLOSEPAREN | SEMICOLON | EOF)
  ;

managementFromQueryPayload
  : Tokens+=managementCommandQueryToken*
  ;

managementGenericBody
  : Tokens+=managementCommandToken+
  ;

managementCommandName
  : managementCommandNameSegment ((DASH | DOT) managementCommandNameSegment)*
  ;

managementCommandNameSegment
  : ~(DASH | DOT | BAR | SEMICOLON | EOF)
  ;

managementCommandIdentifier
  : IDENTIFIER
  ;

managementCommandToken
  : ~(BAR | SEMICOLON | EOF)
  ;

managementCommandQueryToken
  : ~(SEMICOLON | EOF)
  ;
