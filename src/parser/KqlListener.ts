
import { ErrorNode, ParseTreeListener, ParserRuleContext, TerminalNode } from "antlr4ng";


import { TopContext } from "./KqlParser.js";
import { QueryContext } from "./KqlParser.js";
import { StatementContext } from "./KqlParser.js";
import { AliasDatabaseStatementContext } from "./KqlParser.js";
import { LetStatementContext } from "./KqlParser.js";
import { LetVariableDeclarationContext } from "./KqlParser.js";
import { LetFunctionDeclarationContext } from "./KqlParser.js";
import { LetViewDeclarationContext } from "./KqlParser.js";
import { LetViewParameterListContext } from "./KqlParser.js";
import { LetMaterializeDeclarationContext } from "./KqlParser.js";
import { LetEntityGroupDeclarationContext } from "./KqlParser.js";
import { LetFunctionParameterListContext } from "./KqlParser.js";
import { ScalarParameterContext } from "./KqlParser.js";
import { ScalarParameterDefaultContext } from "./KqlParser.js";
import { TabularParameterContext } from "./KqlParser.js";
import { TabularParameterOpenSchemaContext } from "./KqlParser.js";
import { TabularParameterRowSchemaContext } from "./KqlParser.js";
import { TabularParameterRowSchemaColumnDeclarationContext } from "./KqlParser.js";
import { LetFunctionBodyContext } from "./KqlParser.js";
import { LetFunctionBodyStatementContext } from "./KqlParser.js";
import { DeclarePatternStatementContext } from "./KqlParser.js";
import { DeclarePatternDefinitionContext } from "./KqlParser.js";
import { DeclarePatternParameterListContext } from "./KqlParser.js";
import { DeclarePatternParameterContext } from "./KqlParser.js";
import { DeclarePatternPathParameterContext } from "./KqlParser.js";
import { DeclarePatternRuleContext } from "./KqlParser.js";
import { DeclarePatternRuleArgumentListContext } from "./KqlParser.js";
import { DeclarePatternRulePathArgumentContext } from "./KqlParser.js";
import { DeclarePatternRuleArgumentContext } from "./KqlParser.js";
import { DeclarePatternBodyContext } from "./KqlParser.js";
import { RestrictAccessStatementContext } from "./KqlParser.js";
import { RestrictAccessStatementEntityContext } from "./KqlParser.js";
import { SetStatementContext } from "./KqlParser.js";
import { SetStatementOptionValueContext } from "./KqlParser.js";
import { DeclareQueryParametersStatementContext } from "./KqlParser.js";
import { DeclareQueryParametersStatementParameterContext } from "./KqlParser.js";
import { QueryStatementContext } from "./KqlParser.js";
import { ExpressionContext } from "./KqlParser.js";
import { PipeExpressionContext } from "./KqlParser.js";
import { PipedOperatorContext } from "./KqlParser.js";
import { PipeSubExpressionContext } from "./KqlParser.js";
import { BeforePipeExpressionContext } from "./KqlParser.js";
import { AfterPipeOperatorContext } from "./KqlParser.js";
import { BeforeOrAfterPipeOperatorContext } from "./KqlParser.js";
import { ForkPipeOperatorContext } from "./KqlParser.js";
import { AsOperatorContext } from "./KqlParser.js";
import { AssertSchemaOperatorContext } from "./KqlParser.js";
import { ConsumeOperatorContext } from "./KqlParser.js";
import { CountOperatorContext } from "./KqlParser.js";
import { CountOperatorAsClauseContext } from "./KqlParser.js";
import { DistinctOperatorContext } from "./KqlParser.js";
import { DistinctOperatorStarTargetContext } from "./KqlParser.js";
import { DistinctOperatorColumnListTargetContext } from "./KqlParser.js";
import { EvaluateOperatorContext } from "./KqlParser.js";
import { EvaluateOperatorSchemaClauseContext } from "./KqlParser.js";
import { ExtendOperatorContext } from "./KqlParser.js";
import { ExecuteAndCacheOperatorContext } from "./KqlParser.js";
import { FacetByOperatorContext } from "./KqlParser.js";
import { FacetByOperatorWithOperatorClauseContext } from "./KqlParser.js";
import { FacetByOperatorWithExpressionClauseContext } from "./KqlParser.js";
import { FindOperatorContext } from "./KqlParser.js";
import { FindOperatorParametersWhereClauseContext } from "./KqlParser.js";
import { FindOperatorInClauseContext } from "./KqlParser.js";
import { FindOperatorProjectClauseContext } from "./KqlParser.js";
import { FindOperatorProjectExpressionContext } from "./KqlParser.js";
import { FindOperatorColumnExpressionContext } from "./KqlParser.js";
import { FindOperatorOptionalColumnTypeContext } from "./KqlParser.js";
import { FindOperatorPackExpressionContext } from "./KqlParser.js";
import { FindOperatorProjectSmartClauseContext } from "./KqlParser.js";
import { FindOperatorProjectAwayClauseContext } from "./KqlParser.js";
import { FindOperatorProjectAwayStarContext } from "./KqlParser.js";
import { FindOperatorProjectAwayColumnListContext } from "./KqlParser.js";
import { FindOperatorSourceContext } from "./KqlParser.js";
import { FindOperatorSourceEntityExpressionContext } from "./KqlParser.js";
import { ForkOperatorContext } from "./KqlParser.js";
import { ForkOperatorForkContext } from "./KqlParser.js";
import { ForkOperatorExpressionNameContext } from "./KqlParser.js";
import { ForkOperatorExpressionContext } from "./KqlParser.js";
import { ForkOperatorPipedOperatorContext } from "./KqlParser.js";
import { GetSchemaOperatorContext } from "./KqlParser.js";
import { GraphMarkComponentsOperatorContext } from "./KqlParser.js";
import { GraphMatchOperatorContext } from "./KqlParser.js";
import { GraphMatchPatternContext } from "./KqlParser.js";
import { GraphMatchPatternNodeContext } from "./KqlParser.js";
import { GraphMatchPatternUnnamedEdgeContext } from "./KqlParser.js";
import { GraphMatchPatternNamedEdgeContext } from "./KqlParser.js";
import { GraphMatchPatternRangeContext } from "./KqlParser.js";
import { GraphMatchWhereClauseContext } from "./KqlParser.js";
import { GraphMatchProjectClauseContext } from "./KqlParser.js";
import { GraphToTableOperatorContext } from "./KqlParser.js";
import { GraphToTableOutputContext } from "./KqlParser.js";
import { GraphToTableAsClauseContext } from "./KqlParser.js";
import { GraphShortestPathsOperatorContext } from "./KqlParser.js";
import { InvokeOperatorContext } from "./KqlParser.js";
import { JoinOperatorContext } from "./KqlParser.js";
import { JoinOperatorOnClauseContext } from "./KqlParser.js";
import { JoinOperatorWhereClauseContext } from "./KqlParser.js";
import { LookupOperatorContext } from "./KqlParser.js";
import { MacroExpandOperatorContext } from "./KqlParser.js";
import { MacroExpandEntityGroupContext } from "./KqlParser.js";
import { EntityGroupExpressionContext } from "./KqlParser.js";
import { MakeGraphOperatorContext } from "./KqlParser.js";
import { MakeGraphIdClauseContext } from "./KqlParser.js";
import { MakeGraphTablesAndKeysClauseContext } from "./KqlParser.js";
import { MakeGraphPartitionedByClauseContext } from "./KqlParser.js";
import { MakeSeriesOperatorContext } from "./KqlParser.js";
import { MakeSeriesOperatorOnClauseContext } from "./KqlParser.js";
import { MakeSeriesOperatorAggregationContext } from "./KqlParser.js";
import { MakeSeriesOperatorExpressionDefaultClauseContext } from "./KqlParser.js";
import { MakeSeriesOperatorInRangeClauseContext } from "./KqlParser.js";
import { MakeSeriesOperatorFromToStepClauseContext } from "./KqlParser.js";
import { MakeSeriesOperatorByClauseContext } from "./KqlParser.js";
import { MvapplyOperatorContext } from "./KqlParser.js";
import { MvapplyOperatorLimitClauseContext } from "./KqlParser.js";
import { MvapplyOperatorIdClauseContext } from "./KqlParser.js";
import { MvapplyOperatorExpressionContext } from "./KqlParser.js";
import { MvapplyOperatorExpressionToClauseContext } from "./KqlParser.js";
import { MvexpandOperatorContext } from "./KqlParser.js";
import { MvexpandOperatorExpressionContext } from "./KqlParser.js";
import { ParseOperatorContext } from "./KqlParser.js";
import { ParseOperatorKindClauseContext } from "./KqlParser.js";
import { ParseOperatorFlagsClauseContext } from "./KqlParser.js";
import { ParseOperatorNameAndOptionalTypeContext } from "./KqlParser.js";
import { ParseOperatorPatternContext } from "./KqlParser.js";
import { ParseOperatorPatternSegmentContext } from "./KqlParser.js";
import { ParseWhereOperatorContext } from "./KqlParser.js";
import { ParseKvOperatorContext } from "./KqlParser.js";
import { ParseKvWithClauseContext } from "./KqlParser.js";
import { PartitionOperatorContext } from "./KqlParser.js";
import { PartitionOperatorInClauseContext } from "./KqlParser.js";
import { PartitionOperatorSubExpressionBodyContext } from "./KqlParser.js";
import { PartitionOperatorFullExpressionBodyContext } from "./KqlParser.js";
import { PartitionByOperatorContext } from "./KqlParser.js";
import { PartitionByOperatorIdClauseContext } from "./KqlParser.js";
import { PrintOperatorContext } from "./KqlParser.js";
import { ProjectAwayOperatorContext } from "./KqlParser.js";
import { ProjectKeepOperatorContext } from "./KqlParser.js";
import { ProjectOperatorContext } from "./KqlParser.js";
import { ProjectRenameOperatorContext } from "./KqlParser.js";
import { ProjectReorderOperatorContext } from "./KqlParser.js";
import { ProjectReorderExpressionContext } from "./KqlParser.js";
import { ReduceByOperatorContext } from "./KqlParser.js";
import { ReduceByWithClauseContext } from "./KqlParser.js";
import { RenderOperatorContext } from "./KqlParser.js";
import { RenderOperatorWithClauseContext } from "./KqlParser.js";
import { RenderOperatorLegacyPropertyListContext } from "./KqlParser.js";
import { RenderOperatorPropertyContext } from "./KqlParser.js";
import { RenderPropertyNameListContext } from "./KqlParser.js";
import { RenderOperatorLegacyPropertyContext } from "./KqlParser.js";
import { SampleDistinctOperatorContext } from "./KqlParser.js";
import { SampleOperatorContext } from "./KqlParser.js";
import { ScanOperatorContext } from "./KqlParser.js";
import { ScanOperatorOrderByClauseContext } from "./KqlParser.js";
import { ScanOperatorPartitionByClauseContext } from "./KqlParser.js";
import { ScanOperatorDeclareClauseContext } from "./KqlParser.js";
import { ScanOperatorStepContext } from "./KqlParser.js";
import { ScanOperatorStepOutputClauseContext } from "./KqlParser.js";
import { ScanOperatorBodyContext } from "./KqlParser.js";
import { ScanOperatorAssignmentContext } from "./KqlParser.js";
import { SearchOperatorContext } from "./KqlParser.js";
import { SearchOperatorStarAndExpressionContext } from "./KqlParser.js";
import { SearchOperatorInClauseContext } from "./KqlParser.js";
import { SerializeOperatorContext } from "./KqlParser.js";
import { SortOperatorContext } from "./KqlParser.js";
import { OrderedExpressionContext } from "./KqlParser.js";
import { SortOrderingContext } from "./KqlParser.js";
import { SummarizeOperatorContext } from "./KqlParser.js";
import { SummarizeOperatorByClauseContext } from "./KqlParser.js";
import { SummarizeOperatorLegacyBinClauseContext } from "./KqlParser.js";
import { TakeOperatorContext } from "./KqlParser.js";
import { TopOperatorContext } from "./KqlParser.js";
import { TopHittersOperatorContext } from "./KqlParser.js";
import { TopHittersOperatorByClauseContext } from "./KqlParser.js";
import { TopNestedOperatorContext } from "./KqlParser.js";
import { TopNestedOperatorPartContext } from "./KqlParser.js";
import { TopNestedOperatorWithOthersClauseContext } from "./KqlParser.js";
import { UnionOperatorContext } from "./KqlParser.js";
import { UnionOperatorExpressionContext } from "./KqlParser.js";
import { WhereOperatorContext } from "./KqlParser.js";
import { ContextualSubExpressionContext } from "./KqlParser.js";
import { ContextualPipeExpressionContext } from "./KqlParser.js";
import { ContextualPipeExpressionPipedOperatorContext } from "./KqlParser.js";
import { StrictQueryOperatorParameterContext } from "./KqlParser.js";
import { RelaxedQueryOperatorParameterContext } from "./KqlParser.js";
import { QueryOperatorPropertyContext } from "./KqlParser.js";
import { NamedExpressionContext } from "./KqlParser.js";
import { NamedExpressionNameClauseContext } from "./KqlParser.js";
import { NamedExpressionNameListContext } from "./KqlParser.js";
import { ScopedFunctionCallExpressionContext } from "./KqlParser.js";
import { UnnamedExpressionContext } from "./KqlParser.js";
import { LogicalOrExpressionContext } from "./KqlParser.js";
import { LogicalOrOperationContext } from "./KqlParser.js";
import { LogicalAndExpressionContext } from "./KqlParser.js";
import { LogicalAndOperationContext } from "./KqlParser.js";
import { EqualityExpressionContext } from "./KqlParser.js";
import { EqualsEqualityExpressionContext } from "./KqlParser.js";
import { ListEqualityExpressionContext } from "./KqlParser.js";
import { BetweenEqualityExpressionContext } from "./KqlParser.js";
import { StarEqualityExpressionContext } from "./KqlParser.js";
import { RelationalExpressionContext } from "./KqlParser.js";
import { AdditiveExpressionContext } from "./KqlParser.js";
import { AdditiveOperationContext } from "./KqlParser.js";
import { MultiplicativeExpressionContext } from "./KqlParser.js";
import { MultiplicativeOperationContext } from "./KqlParser.js";
import { StringOperatorExpressionContext } from "./KqlParser.js";
import { StringBinaryOperatorExpressionContext } from "./KqlParser.js";
import { StringBinaryOperationContext } from "./KqlParser.js";
import { StringBinaryOperatorContext } from "./KqlParser.js";
import { StringStarOperatorExpressionContext } from "./KqlParser.js";
import { InvocationExpressionContext } from "./KqlParser.js";
import { FunctionCallOrPathExpressionContext } from "./KqlParser.js";
import { FunctionCallOrPathRootContext } from "./KqlParser.js";
import { FunctionCallOrPathPathExpressionContext } from "./KqlParser.js";
import { FunctionCallOrPathOperationContext } from "./KqlParser.js";
import { FunctionCallOrPathPathOperationContext } from "./KqlParser.js";
import { FunctionCallOrPathElementOperationContext } from "./KqlParser.js";
import { LegacyFunctionCallOrPathElementOperationContext } from "./KqlParser.js";
import { ToScalarExpressionContext } from "./KqlParser.js";
import { ToTableExpressionContext } from "./KqlParser.js";
import { NoOptimizationParameterContext } from "./KqlParser.js";
import { DotCompositeFunctionCallExpressionContext } from "./KqlParser.js";
import { DotCompositeFunctionCallOperationContext } from "./KqlParser.js";
import { FunctionCallExpressionContext } from "./KqlParser.js";
import { NamedFunctionCallExpressionContext } from "./KqlParser.js";
import { ArgumentExpressionContext } from "./KqlParser.js";
import { CountExpressionContext } from "./KqlParser.js";
import { StarExpressionContext } from "./KqlParser.js";
import { PrimaryExpressionContext } from "./KqlParser.js";
import { NameReferenceWithDataScopeContext } from "./KqlParser.js";
import { DataScopeClauseContext } from "./KqlParser.js";
import { ParenthesizedExpressionContext } from "./KqlParser.js";
import { RangeExpressionContext } from "./KqlParser.js";
import { EntityExpressionContext } from "./KqlParser.js";
import { EntityPathOrElementExpressionContext } from "./KqlParser.js";
import { EntityPathOrElementOperatorContext } from "./KqlParser.js";
import { EntityPathOperatorContext } from "./KqlParser.js";
import { EntityElementOperatorContext } from "./KqlParser.js";
import { LegacyEntityPathElementOperatorContext } from "./KqlParser.js";
import { EntityNameContext } from "./KqlParser.js";
import { EntityNameReferenceContext } from "./KqlParser.js";
import { AtSignNameContext } from "./KqlParser.js";
import { ExtendedPathNameContext } from "./KqlParser.js";
import { WildcardedEntityExpressionContext } from "./KqlParser.js";
import { WildcardedPathExpressionContext } from "./KqlParser.js";
import { WildcardedPathNameContext } from "./KqlParser.js";
import { ContextualDataTableExpressionContext } from "./KqlParser.js";
import { DataTableExpressionContext } from "./KqlParser.js";
import { RowSchemaContext } from "./KqlParser.js";
import { RowSchemaColumnDeclarationContext } from "./KqlParser.js";
import { ExternalDataExpressionContext } from "./KqlParser.js";
import { ExternalDataWithClauseContext } from "./KqlParser.js";
import { ExternalDataWithClausePropertyContext } from "./KqlParser.js";
import { MaterializedViewCombineExpressionContext } from "./KqlParser.js";
import { MaterializeViewCombineBaseClauseContext } from "./KqlParser.js";
import { MaterializedViewCombineDeltaClauseContext } from "./KqlParser.js";
import { MaterializedViewCombineAggregationsClauseContext } from "./KqlParser.js";
import { ScalarTypeContext } from "./KqlParser.js";
import { ExtendedScalarTypeContext } from "./KqlParser.js";
import { ParameterNameContext } from "./KqlParser.js";
import { SimpleNameReferenceContext } from "./KqlParser.js";
import { ExtendedNameReferenceContext } from "./KqlParser.js";
import { WildcardedNameReferenceContext } from "./KqlParser.js";
import { SimpleOrWildcardedNameReferenceContext } from "./KqlParser.js";
import { IdentifierNameContext } from "./KqlParser.js";
import { KeywordNameContext } from "./KqlParser.js";
import { ExtendedKeywordNameContext } from "./KqlParser.js";
import { EscapedNameContext } from "./KqlParser.js";
import { IdentifierOrKeywordNameContext } from "./KqlParser.js";
import { IdentifierOrKeywordOrEscapedNameContext } from "./KqlParser.js";
import { IdentifierOrExtendedKeywordOrEscapedNameContext } from "./KqlParser.js";
import { IdentifierOrExtendedKeywordNameContext } from "./KqlParser.js";
import { WildcardedNameContext } from "./KqlParser.js";
import { WildcardedNamePrefixContext } from "./KqlParser.js";
import { WildcardedNameSegmentContext } from "./KqlParser.js";
import { LiteralExpressionContext } from "./KqlParser.js";
import { UnsignedLiteralExpressionContext } from "./KqlParser.js";
import { NumberLikeLiteralExpressionContext } from "./KqlParser.js";
import { NumericLiteralExpressionContext } from "./KqlParser.js";
import { SignedLiteralExpressionContext } from "./KqlParser.js";
import { LongLiteralExpressionContext } from "./KqlParser.js";
import { IntLiteralExpressionContext } from "./KqlParser.js";
import { RealLiteralExpressionContext } from "./KqlParser.js";
import { DecimalLiteralExpressionContext } from "./KqlParser.js";
import { DateTimeLiteralExpressionContext } from "./KqlParser.js";
import { TimeSpanLiteralExpressionContext } from "./KqlParser.js";
import { BooleanLiteralExpressionContext } from "./KqlParser.js";
import { GuidLiteralExpressionContext } from "./KqlParser.js";
import { TypeLiteralExpressionContext } from "./KqlParser.js";
import { SignedLongLiteralExpressionContext } from "./KqlParser.js";
import { SignedRealLiteralExpressionContext } from "./KqlParser.js";
import { StringLiteralExpressionContext } from "./KqlParser.js";
import { DynamicLiteralExpressionContext } from "./KqlParser.js";
import { JsonValueContext } from "./KqlParser.js";
import { JsonObjectContext } from "./KqlParser.js";
import { JsonPairContext } from "./KqlParser.js";
import { JsonArrayContext } from "./KqlParser.js";
import { JsonBooleanContext } from "./KqlParser.js";
import { JsonDateTimeContext } from "./KqlParser.js";
import { JsonGuidContext } from "./KqlParser.js";
import { JsonNullContext } from "./KqlParser.js";
import { JsonStringContext } from "./KqlParser.js";
import { JsonTimeSpanContext } from "./KqlParser.js";
import { JsonLongContext } from "./KqlParser.js";
import { JsonRealContext } from "./KqlParser.js";
import { ManagementCommandExpressionContext } from "./KqlParser.js";
import { ManagementCommandBodyContext } from "./KqlParser.js";
import { ManagementTableWithSchemaBodyContext } from "./KqlParser.js";
import { ManagementSchemaTextContext } from "./KqlParser.js";
import { ManagementSchemaTokenContext } from "./KqlParser.js";
import { ManagementTableTargetBodyContext } from "./KqlParser.js";
import { ManagementDropTableBodyContext } from "./KqlParser.js";
import { ManagementShowBodyContext } from "./KqlParser.js";
import { ManagementIngestInlineBodyContext } from "./KqlParser.js";
import { ManagementIngestFromUriBodyContext } from "./KqlParser.js";
import { ManagementIngestInlinePropertiesContext } from "./KqlParser.js";
import { ManagementIngestInlinePropertyTokenContext } from "./KqlParser.js";
import { ManagementIngestSourceTextContext } from "./KqlParser.js";
import { ManagementIngestSourceTokenContext } from "./KqlParser.js";
import { ManagementFromQueryPayloadContext } from "./KqlParser.js";
import { ManagementGenericBodyContext } from "./KqlParser.js";
import { ManagementCommandNameContext } from "./KqlParser.js";
import { ManagementCommandNameSegmentContext } from "./KqlParser.js";
import { ManagementCommandIdentifierContext } from "./KqlParser.js";
import { ManagementCommandTokenContext } from "./KqlParser.js";
import { ManagementCommandQueryTokenContext } from "./KqlParser.js";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `KqlParser`.
 */
export class KqlListener implements ParseTreeListener {
    /**
     * Enter a parse tree produced by `KqlParser.top`.
     * @param ctx the parse tree
     */
    enterTop?: (ctx: TopContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.top`.
     * @param ctx the parse tree
     */
    exitTop?: (ctx: TopContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.query`.
     * @param ctx the parse tree
     */
    enterQuery?: (ctx: QueryContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.query`.
     * @param ctx the parse tree
     */
    exitQuery?: (ctx: QueryContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.statement`.
     * @param ctx the parse tree
     */
    enterStatement?: (ctx: StatementContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.statement`.
     * @param ctx the parse tree
     */
    exitStatement?: (ctx: StatementContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.aliasDatabaseStatement`.
     * @param ctx the parse tree
     */
    enterAliasDatabaseStatement?: (ctx: AliasDatabaseStatementContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.aliasDatabaseStatement`.
     * @param ctx the parse tree
     */
    exitAliasDatabaseStatement?: (ctx: AliasDatabaseStatementContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.letStatement`.
     * @param ctx the parse tree
     */
    enterLetStatement?: (ctx: LetStatementContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.letStatement`.
     * @param ctx the parse tree
     */
    exitLetStatement?: (ctx: LetStatementContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.letVariableDeclaration`.
     * @param ctx the parse tree
     */
    enterLetVariableDeclaration?: (ctx: LetVariableDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.letVariableDeclaration`.
     * @param ctx the parse tree
     */
    exitLetVariableDeclaration?: (ctx: LetVariableDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.letFunctionDeclaration`.
     * @param ctx the parse tree
     */
    enterLetFunctionDeclaration?: (ctx: LetFunctionDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.letFunctionDeclaration`.
     * @param ctx the parse tree
     */
    exitLetFunctionDeclaration?: (ctx: LetFunctionDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.letViewDeclaration`.
     * @param ctx the parse tree
     */
    enterLetViewDeclaration?: (ctx: LetViewDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.letViewDeclaration`.
     * @param ctx the parse tree
     */
    exitLetViewDeclaration?: (ctx: LetViewDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.letViewParameterList`.
     * @param ctx the parse tree
     */
    enterLetViewParameterList?: (ctx: LetViewParameterListContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.letViewParameterList`.
     * @param ctx the parse tree
     */
    exitLetViewParameterList?: (ctx: LetViewParameterListContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.letMaterializeDeclaration`.
     * @param ctx the parse tree
     */
    enterLetMaterializeDeclaration?: (ctx: LetMaterializeDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.letMaterializeDeclaration`.
     * @param ctx the parse tree
     */
    exitLetMaterializeDeclaration?: (ctx: LetMaterializeDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.letEntityGroupDeclaration`.
     * @param ctx the parse tree
     */
    enterLetEntityGroupDeclaration?: (ctx: LetEntityGroupDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.letEntityGroupDeclaration`.
     * @param ctx the parse tree
     */
    exitLetEntityGroupDeclaration?: (ctx: LetEntityGroupDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.letFunctionParameterList`.
     * @param ctx the parse tree
     */
    enterLetFunctionParameterList?: (ctx: LetFunctionParameterListContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.letFunctionParameterList`.
     * @param ctx the parse tree
     */
    exitLetFunctionParameterList?: (ctx: LetFunctionParameterListContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scalarParameter`.
     * @param ctx the parse tree
     */
    enterScalarParameter?: (ctx: ScalarParameterContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scalarParameter`.
     * @param ctx the parse tree
     */
    exitScalarParameter?: (ctx: ScalarParameterContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scalarParameterDefault`.
     * @param ctx the parse tree
     */
    enterScalarParameterDefault?: (ctx: ScalarParameterDefaultContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scalarParameterDefault`.
     * @param ctx the parse tree
     */
    exitScalarParameterDefault?: (ctx: ScalarParameterDefaultContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.tabularParameter`.
     * @param ctx the parse tree
     */
    enterTabularParameter?: (ctx: TabularParameterContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.tabularParameter`.
     * @param ctx the parse tree
     */
    exitTabularParameter?: (ctx: TabularParameterContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.tabularParameterOpenSchema`.
     * @param ctx the parse tree
     */
    enterTabularParameterOpenSchema?: (ctx: TabularParameterOpenSchemaContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.tabularParameterOpenSchema`.
     * @param ctx the parse tree
     */
    exitTabularParameterOpenSchema?: (ctx: TabularParameterOpenSchemaContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.tabularParameterRowSchema`.
     * @param ctx the parse tree
     */
    enterTabularParameterRowSchema?: (ctx: TabularParameterRowSchemaContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.tabularParameterRowSchema`.
     * @param ctx the parse tree
     */
    exitTabularParameterRowSchema?: (ctx: TabularParameterRowSchemaContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.tabularParameterRowSchemaColumnDeclaration`.
     * @param ctx the parse tree
     */
    enterTabularParameterRowSchemaColumnDeclaration?: (ctx: TabularParameterRowSchemaColumnDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.tabularParameterRowSchemaColumnDeclaration`.
     * @param ctx the parse tree
     */
    exitTabularParameterRowSchemaColumnDeclaration?: (ctx: TabularParameterRowSchemaColumnDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.letFunctionBody`.
     * @param ctx the parse tree
     */
    enterLetFunctionBody?: (ctx: LetFunctionBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.letFunctionBody`.
     * @param ctx the parse tree
     */
    exitLetFunctionBody?: (ctx: LetFunctionBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.letFunctionBodyStatement`.
     * @param ctx the parse tree
     */
    enterLetFunctionBodyStatement?: (ctx: LetFunctionBodyStatementContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.letFunctionBodyStatement`.
     * @param ctx the parse tree
     */
    exitLetFunctionBodyStatement?: (ctx: LetFunctionBodyStatementContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declarePatternStatement`.
     * @param ctx the parse tree
     */
    enterDeclarePatternStatement?: (ctx: DeclarePatternStatementContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declarePatternStatement`.
     * @param ctx the parse tree
     */
    exitDeclarePatternStatement?: (ctx: DeclarePatternStatementContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declarePatternDefinition`.
     * @param ctx the parse tree
     */
    enterDeclarePatternDefinition?: (ctx: DeclarePatternDefinitionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declarePatternDefinition`.
     * @param ctx the parse tree
     */
    exitDeclarePatternDefinition?: (ctx: DeclarePatternDefinitionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declarePatternParameterList`.
     * @param ctx the parse tree
     */
    enterDeclarePatternParameterList?: (ctx: DeclarePatternParameterListContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declarePatternParameterList`.
     * @param ctx the parse tree
     */
    exitDeclarePatternParameterList?: (ctx: DeclarePatternParameterListContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declarePatternParameter`.
     * @param ctx the parse tree
     */
    enterDeclarePatternParameter?: (ctx: DeclarePatternParameterContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declarePatternParameter`.
     * @param ctx the parse tree
     */
    exitDeclarePatternParameter?: (ctx: DeclarePatternParameterContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declarePatternPathParameter`.
     * @param ctx the parse tree
     */
    enterDeclarePatternPathParameter?: (ctx: DeclarePatternPathParameterContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declarePatternPathParameter`.
     * @param ctx the parse tree
     */
    exitDeclarePatternPathParameter?: (ctx: DeclarePatternPathParameterContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declarePatternRule`.
     * @param ctx the parse tree
     */
    enterDeclarePatternRule?: (ctx: DeclarePatternRuleContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declarePatternRule`.
     * @param ctx the parse tree
     */
    exitDeclarePatternRule?: (ctx: DeclarePatternRuleContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declarePatternRuleArgumentList`.
     * @param ctx the parse tree
     */
    enterDeclarePatternRuleArgumentList?: (ctx: DeclarePatternRuleArgumentListContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declarePatternRuleArgumentList`.
     * @param ctx the parse tree
     */
    exitDeclarePatternRuleArgumentList?: (ctx: DeclarePatternRuleArgumentListContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declarePatternRulePathArgument`.
     * @param ctx the parse tree
     */
    enterDeclarePatternRulePathArgument?: (ctx: DeclarePatternRulePathArgumentContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declarePatternRulePathArgument`.
     * @param ctx the parse tree
     */
    exitDeclarePatternRulePathArgument?: (ctx: DeclarePatternRulePathArgumentContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declarePatternRuleArgument`.
     * @param ctx the parse tree
     */
    enterDeclarePatternRuleArgument?: (ctx: DeclarePatternRuleArgumentContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declarePatternRuleArgument`.
     * @param ctx the parse tree
     */
    exitDeclarePatternRuleArgument?: (ctx: DeclarePatternRuleArgumentContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declarePatternBody`.
     * @param ctx the parse tree
     */
    enterDeclarePatternBody?: (ctx: DeclarePatternBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declarePatternBody`.
     * @param ctx the parse tree
     */
    exitDeclarePatternBody?: (ctx: DeclarePatternBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.restrictAccessStatement`.
     * @param ctx the parse tree
     */
    enterRestrictAccessStatement?: (ctx: RestrictAccessStatementContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.restrictAccessStatement`.
     * @param ctx the parse tree
     */
    exitRestrictAccessStatement?: (ctx: RestrictAccessStatementContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.restrictAccessStatementEntity`.
     * @param ctx the parse tree
     */
    enterRestrictAccessStatementEntity?: (ctx: RestrictAccessStatementEntityContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.restrictAccessStatementEntity`.
     * @param ctx the parse tree
     */
    exitRestrictAccessStatementEntity?: (ctx: RestrictAccessStatementEntityContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.setStatement`.
     * @param ctx the parse tree
     */
    enterSetStatement?: (ctx: SetStatementContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.setStatement`.
     * @param ctx the parse tree
     */
    exitSetStatement?: (ctx: SetStatementContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.setStatementOptionValue`.
     * @param ctx the parse tree
     */
    enterSetStatementOptionValue?: (ctx: SetStatementOptionValueContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.setStatementOptionValue`.
     * @param ctx the parse tree
     */
    exitSetStatementOptionValue?: (ctx: SetStatementOptionValueContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declareQueryParametersStatement`.
     * @param ctx the parse tree
     */
    enterDeclareQueryParametersStatement?: (ctx: DeclareQueryParametersStatementContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declareQueryParametersStatement`.
     * @param ctx the parse tree
     */
    exitDeclareQueryParametersStatement?: (ctx: DeclareQueryParametersStatementContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.declareQueryParametersStatementParameter`.
     * @param ctx the parse tree
     */
    enterDeclareQueryParametersStatementParameter?: (ctx: DeclareQueryParametersStatementParameterContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.declareQueryParametersStatementParameter`.
     * @param ctx the parse tree
     */
    exitDeclareQueryParametersStatementParameter?: (ctx: DeclareQueryParametersStatementParameterContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.queryStatement`.
     * @param ctx the parse tree
     */
    enterQueryStatement?: (ctx: QueryStatementContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.queryStatement`.
     * @param ctx the parse tree
     */
    exitQueryStatement?: (ctx: QueryStatementContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.expression`.
     * @param ctx the parse tree
     */
    enterExpression?: (ctx: ExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.expression`.
     * @param ctx the parse tree
     */
    exitExpression?: (ctx: ExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.pipeExpression`.
     * @param ctx the parse tree
     */
    enterPipeExpression?: (ctx: PipeExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.pipeExpression`.
     * @param ctx the parse tree
     */
    exitPipeExpression?: (ctx: PipeExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.pipedOperator`.
     * @param ctx the parse tree
     */
    enterPipedOperator?: (ctx: PipedOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.pipedOperator`.
     * @param ctx the parse tree
     */
    exitPipedOperator?: (ctx: PipedOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.pipeSubExpression`.
     * @param ctx the parse tree
     */
    enterPipeSubExpression?: (ctx: PipeSubExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.pipeSubExpression`.
     * @param ctx the parse tree
     */
    exitPipeSubExpression?: (ctx: PipeSubExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.beforePipeExpression`.
     * @param ctx the parse tree
     */
    enterBeforePipeExpression?: (ctx: BeforePipeExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.beforePipeExpression`.
     * @param ctx the parse tree
     */
    exitBeforePipeExpression?: (ctx: BeforePipeExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.afterPipeOperator`.
     * @param ctx the parse tree
     */
    enterAfterPipeOperator?: (ctx: AfterPipeOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.afterPipeOperator`.
     * @param ctx the parse tree
     */
    exitAfterPipeOperator?: (ctx: AfterPipeOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.beforeOrAfterPipeOperator`.
     * @param ctx the parse tree
     */
    enterBeforeOrAfterPipeOperator?: (ctx: BeforeOrAfterPipeOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.beforeOrAfterPipeOperator`.
     * @param ctx the parse tree
     */
    exitBeforeOrAfterPipeOperator?: (ctx: BeforeOrAfterPipeOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.forkPipeOperator`.
     * @param ctx the parse tree
     */
    enterForkPipeOperator?: (ctx: ForkPipeOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.forkPipeOperator`.
     * @param ctx the parse tree
     */
    exitForkPipeOperator?: (ctx: ForkPipeOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.asOperator`.
     * @param ctx the parse tree
     */
    enterAsOperator?: (ctx: AsOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.asOperator`.
     * @param ctx the parse tree
     */
    exitAsOperator?: (ctx: AsOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.assertSchemaOperator`.
     * @param ctx the parse tree
     */
    enterAssertSchemaOperator?: (ctx: AssertSchemaOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.assertSchemaOperator`.
     * @param ctx the parse tree
     */
    exitAssertSchemaOperator?: (ctx: AssertSchemaOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.consumeOperator`.
     * @param ctx the parse tree
     */
    enterConsumeOperator?: (ctx: ConsumeOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.consumeOperator`.
     * @param ctx the parse tree
     */
    exitConsumeOperator?: (ctx: ConsumeOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.countOperator`.
     * @param ctx the parse tree
     */
    enterCountOperator?: (ctx: CountOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.countOperator`.
     * @param ctx the parse tree
     */
    exitCountOperator?: (ctx: CountOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.countOperatorAsClause`.
     * @param ctx the parse tree
     */
    enterCountOperatorAsClause?: (ctx: CountOperatorAsClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.countOperatorAsClause`.
     * @param ctx the parse tree
     */
    exitCountOperatorAsClause?: (ctx: CountOperatorAsClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.distinctOperator`.
     * @param ctx the parse tree
     */
    enterDistinctOperator?: (ctx: DistinctOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.distinctOperator`.
     * @param ctx the parse tree
     */
    exitDistinctOperator?: (ctx: DistinctOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.distinctOperatorStarTarget`.
     * @param ctx the parse tree
     */
    enterDistinctOperatorStarTarget?: (ctx: DistinctOperatorStarTargetContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.distinctOperatorStarTarget`.
     * @param ctx the parse tree
     */
    exitDistinctOperatorStarTarget?: (ctx: DistinctOperatorStarTargetContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.distinctOperatorColumnListTarget`.
     * @param ctx the parse tree
     */
    enterDistinctOperatorColumnListTarget?: (ctx: DistinctOperatorColumnListTargetContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.distinctOperatorColumnListTarget`.
     * @param ctx the parse tree
     */
    exitDistinctOperatorColumnListTarget?: (ctx: DistinctOperatorColumnListTargetContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.evaluateOperator`.
     * @param ctx the parse tree
     */
    enterEvaluateOperator?: (ctx: EvaluateOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.evaluateOperator`.
     * @param ctx the parse tree
     */
    exitEvaluateOperator?: (ctx: EvaluateOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.evaluateOperatorSchemaClause`.
     * @param ctx the parse tree
     */
    enterEvaluateOperatorSchemaClause?: (ctx: EvaluateOperatorSchemaClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.evaluateOperatorSchemaClause`.
     * @param ctx the parse tree
     */
    exitEvaluateOperatorSchemaClause?: (ctx: EvaluateOperatorSchemaClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.extendOperator`.
     * @param ctx the parse tree
     */
    enterExtendOperator?: (ctx: ExtendOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.extendOperator`.
     * @param ctx the parse tree
     */
    exitExtendOperator?: (ctx: ExtendOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.executeAndCacheOperator`.
     * @param ctx the parse tree
     */
    enterExecuteAndCacheOperator?: (ctx: ExecuteAndCacheOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.executeAndCacheOperator`.
     * @param ctx the parse tree
     */
    exitExecuteAndCacheOperator?: (ctx: ExecuteAndCacheOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.facetByOperator`.
     * @param ctx the parse tree
     */
    enterFacetByOperator?: (ctx: FacetByOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.facetByOperator`.
     * @param ctx the parse tree
     */
    exitFacetByOperator?: (ctx: FacetByOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.facetByOperatorWithOperatorClause`.
     * @param ctx the parse tree
     */
    enterFacetByOperatorWithOperatorClause?: (ctx: FacetByOperatorWithOperatorClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.facetByOperatorWithOperatorClause`.
     * @param ctx the parse tree
     */
    exitFacetByOperatorWithOperatorClause?: (ctx: FacetByOperatorWithOperatorClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.facetByOperatorWithExpressionClause`.
     * @param ctx the parse tree
     */
    enterFacetByOperatorWithExpressionClause?: (ctx: FacetByOperatorWithExpressionClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.facetByOperatorWithExpressionClause`.
     * @param ctx the parse tree
     */
    exitFacetByOperatorWithExpressionClause?: (ctx: FacetByOperatorWithExpressionClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperator`.
     * @param ctx the parse tree
     */
    enterFindOperator?: (ctx: FindOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperator`.
     * @param ctx the parse tree
     */
    exitFindOperator?: (ctx: FindOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorParametersWhereClause`.
     * @param ctx the parse tree
     */
    enterFindOperatorParametersWhereClause?: (ctx: FindOperatorParametersWhereClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorParametersWhereClause`.
     * @param ctx the parse tree
     */
    exitFindOperatorParametersWhereClause?: (ctx: FindOperatorParametersWhereClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorInClause`.
     * @param ctx the parse tree
     */
    enterFindOperatorInClause?: (ctx: FindOperatorInClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorInClause`.
     * @param ctx the parse tree
     */
    exitFindOperatorInClause?: (ctx: FindOperatorInClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorProjectClause`.
     * @param ctx the parse tree
     */
    enterFindOperatorProjectClause?: (ctx: FindOperatorProjectClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorProjectClause`.
     * @param ctx the parse tree
     */
    exitFindOperatorProjectClause?: (ctx: FindOperatorProjectClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorProjectExpression`.
     * @param ctx the parse tree
     */
    enterFindOperatorProjectExpression?: (ctx: FindOperatorProjectExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorProjectExpression`.
     * @param ctx the parse tree
     */
    exitFindOperatorProjectExpression?: (ctx: FindOperatorProjectExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorColumnExpression`.
     * @param ctx the parse tree
     */
    enterFindOperatorColumnExpression?: (ctx: FindOperatorColumnExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorColumnExpression`.
     * @param ctx the parse tree
     */
    exitFindOperatorColumnExpression?: (ctx: FindOperatorColumnExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorOptionalColumnType`.
     * @param ctx the parse tree
     */
    enterFindOperatorOptionalColumnType?: (ctx: FindOperatorOptionalColumnTypeContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorOptionalColumnType`.
     * @param ctx the parse tree
     */
    exitFindOperatorOptionalColumnType?: (ctx: FindOperatorOptionalColumnTypeContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorPackExpression`.
     * @param ctx the parse tree
     */
    enterFindOperatorPackExpression?: (ctx: FindOperatorPackExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorPackExpression`.
     * @param ctx the parse tree
     */
    exitFindOperatorPackExpression?: (ctx: FindOperatorPackExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorProjectSmartClause`.
     * @param ctx the parse tree
     */
    enterFindOperatorProjectSmartClause?: (ctx: FindOperatorProjectSmartClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorProjectSmartClause`.
     * @param ctx the parse tree
     */
    exitFindOperatorProjectSmartClause?: (ctx: FindOperatorProjectSmartClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorProjectAwayClause`.
     * @param ctx the parse tree
     */
    enterFindOperatorProjectAwayClause?: (ctx: FindOperatorProjectAwayClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorProjectAwayClause`.
     * @param ctx the parse tree
     */
    exitFindOperatorProjectAwayClause?: (ctx: FindOperatorProjectAwayClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorProjectAwayStar`.
     * @param ctx the parse tree
     */
    enterFindOperatorProjectAwayStar?: (ctx: FindOperatorProjectAwayStarContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorProjectAwayStar`.
     * @param ctx the parse tree
     */
    exitFindOperatorProjectAwayStar?: (ctx: FindOperatorProjectAwayStarContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorProjectAwayColumnList`.
     * @param ctx the parse tree
     */
    enterFindOperatorProjectAwayColumnList?: (ctx: FindOperatorProjectAwayColumnListContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorProjectAwayColumnList`.
     * @param ctx the parse tree
     */
    exitFindOperatorProjectAwayColumnList?: (ctx: FindOperatorProjectAwayColumnListContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorSource`.
     * @param ctx the parse tree
     */
    enterFindOperatorSource?: (ctx: FindOperatorSourceContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorSource`.
     * @param ctx the parse tree
     */
    exitFindOperatorSource?: (ctx: FindOperatorSourceContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.findOperatorSourceEntityExpression`.
     * @param ctx the parse tree
     */
    enterFindOperatorSourceEntityExpression?: (ctx: FindOperatorSourceEntityExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.findOperatorSourceEntityExpression`.
     * @param ctx the parse tree
     */
    exitFindOperatorSourceEntityExpression?: (ctx: FindOperatorSourceEntityExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.forkOperator`.
     * @param ctx the parse tree
     */
    enterForkOperator?: (ctx: ForkOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.forkOperator`.
     * @param ctx the parse tree
     */
    exitForkOperator?: (ctx: ForkOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.forkOperatorFork`.
     * @param ctx the parse tree
     */
    enterForkOperatorFork?: (ctx: ForkOperatorForkContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.forkOperatorFork`.
     * @param ctx the parse tree
     */
    exitForkOperatorFork?: (ctx: ForkOperatorForkContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.forkOperatorExpressionName`.
     * @param ctx the parse tree
     */
    enterForkOperatorExpressionName?: (ctx: ForkOperatorExpressionNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.forkOperatorExpressionName`.
     * @param ctx the parse tree
     */
    exitForkOperatorExpressionName?: (ctx: ForkOperatorExpressionNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.forkOperatorExpression`.
     * @param ctx the parse tree
     */
    enterForkOperatorExpression?: (ctx: ForkOperatorExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.forkOperatorExpression`.
     * @param ctx the parse tree
     */
    exitForkOperatorExpression?: (ctx: ForkOperatorExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.forkOperatorPipedOperator`.
     * @param ctx the parse tree
     */
    enterForkOperatorPipedOperator?: (ctx: ForkOperatorPipedOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.forkOperatorPipedOperator`.
     * @param ctx the parse tree
     */
    exitForkOperatorPipedOperator?: (ctx: ForkOperatorPipedOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.getSchemaOperator`.
     * @param ctx the parse tree
     */
    enterGetSchemaOperator?: (ctx: GetSchemaOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.getSchemaOperator`.
     * @param ctx the parse tree
     */
    exitGetSchemaOperator?: (ctx: GetSchemaOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphMarkComponentsOperator`.
     * @param ctx the parse tree
     */
    enterGraphMarkComponentsOperator?: (ctx: GraphMarkComponentsOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphMarkComponentsOperator`.
     * @param ctx the parse tree
     */
    exitGraphMarkComponentsOperator?: (ctx: GraphMarkComponentsOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphMatchOperator`.
     * @param ctx the parse tree
     */
    enterGraphMatchOperator?: (ctx: GraphMatchOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphMatchOperator`.
     * @param ctx the parse tree
     */
    exitGraphMatchOperator?: (ctx: GraphMatchOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphMatchPattern`.
     * @param ctx the parse tree
     */
    enterGraphMatchPattern?: (ctx: GraphMatchPatternContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphMatchPattern`.
     * @param ctx the parse tree
     */
    exitGraphMatchPattern?: (ctx: GraphMatchPatternContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphMatchPatternNode`.
     * @param ctx the parse tree
     */
    enterGraphMatchPatternNode?: (ctx: GraphMatchPatternNodeContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphMatchPatternNode`.
     * @param ctx the parse tree
     */
    exitGraphMatchPatternNode?: (ctx: GraphMatchPatternNodeContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphMatchPatternUnnamedEdge`.
     * @param ctx the parse tree
     */
    enterGraphMatchPatternUnnamedEdge?: (ctx: GraphMatchPatternUnnamedEdgeContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphMatchPatternUnnamedEdge`.
     * @param ctx the parse tree
     */
    exitGraphMatchPatternUnnamedEdge?: (ctx: GraphMatchPatternUnnamedEdgeContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphMatchPatternNamedEdge`.
     * @param ctx the parse tree
     */
    enterGraphMatchPatternNamedEdge?: (ctx: GraphMatchPatternNamedEdgeContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphMatchPatternNamedEdge`.
     * @param ctx the parse tree
     */
    exitGraphMatchPatternNamedEdge?: (ctx: GraphMatchPatternNamedEdgeContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphMatchPatternRange`.
     * @param ctx the parse tree
     */
    enterGraphMatchPatternRange?: (ctx: GraphMatchPatternRangeContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphMatchPatternRange`.
     * @param ctx the parse tree
     */
    exitGraphMatchPatternRange?: (ctx: GraphMatchPatternRangeContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphMatchWhereClause`.
     * @param ctx the parse tree
     */
    enterGraphMatchWhereClause?: (ctx: GraphMatchWhereClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphMatchWhereClause`.
     * @param ctx the parse tree
     */
    exitGraphMatchWhereClause?: (ctx: GraphMatchWhereClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphMatchProjectClause`.
     * @param ctx the parse tree
     */
    enterGraphMatchProjectClause?: (ctx: GraphMatchProjectClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphMatchProjectClause`.
     * @param ctx the parse tree
     */
    exitGraphMatchProjectClause?: (ctx: GraphMatchProjectClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphToTableOperator`.
     * @param ctx the parse tree
     */
    enterGraphToTableOperator?: (ctx: GraphToTableOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphToTableOperator`.
     * @param ctx the parse tree
     */
    exitGraphToTableOperator?: (ctx: GraphToTableOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphToTableOutput`.
     * @param ctx the parse tree
     */
    enterGraphToTableOutput?: (ctx: GraphToTableOutputContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphToTableOutput`.
     * @param ctx the parse tree
     */
    exitGraphToTableOutput?: (ctx: GraphToTableOutputContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphToTableAsClause`.
     * @param ctx the parse tree
     */
    enterGraphToTableAsClause?: (ctx: GraphToTableAsClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphToTableAsClause`.
     * @param ctx the parse tree
     */
    exitGraphToTableAsClause?: (ctx: GraphToTableAsClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.graphShortestPathsOperator`.
     * @param ctx the parse tree
     */
    enterGraphShortestPathsOperator?: (ctx: GraphShortestPathsOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.graphShortestPathsOperator`.
     * @param ctx the parse tree
     */
    exitGraphShortestPathsOperator?: (ctx: GraphShortestPathsOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.invokeOperator`.
     * @param ctx the parse tree
     */
    enterInvokeOperator?: (ctx: InvokeOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.invokeOperator`.
     * @param ctx the parse tree
     */
    exitInvokeOperator?: (ctx: InvokeOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.joinOperator`.
     * @param ctx the parse tree
     */
    enterJoinOperator?: (ctx: JoinOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.joinOperator`.
     * @param ctx the parse tree
     */
    exitJoinOperator?: (ctx: JoinOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.joinOperatorOnClause`.
     * @param ctx the parse tree
     */
    enterJoinOperatorOnClause?: (ctx: JoinOperatorOnClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.joinOperatorOnClause`.
     * @param ctx the parse tree
     */
    exitJoinOperatorOnClause?: (ctx: JoinOperatorOnClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.joinOperatorWhereClause`.
     * @param ctx the parse tree
     */
    enterJoinOperatorWhereClause?: (ctx: JoinOperatorWhereClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.joinOperatorWhereClause`.
     * @param ctx the parse tree
     */
    exitJoinOperatorWhereClause?: (ctx: JoinOperatorWhereClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.lookupOperator`.
     * @param ctx the parse tree
     */
    enterLookupOperator?: (ctx: LookupOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.lookupOperator`.
     * @param ctx the parse tree
     */
    exitLookupOperator?: (ctx: LookupOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.macroExpandOperator`.
     * @param ctx the parse tree
     */
    enterMacroExpandOperator?: (ctx: MacroExpandOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.macroExpandOperator`.
     * @param ctx the parse tree
     */
    exitMacroExpandOperator?: (ctx: MacroExpandOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.macroExpandEntityGroup`.
     * @param ctx the parse tree
     */
    enterMacroExpandEntityGroup?: (ctx: MacroExpandEntityGroupContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.macroExpandEntityGroup`.
     * @param ctx the parse tree
     */
    exitMacroExpandEntityGroup?: (ctx: MacroExpandEntityGroupContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.entityGroupExpression`.
     * @param ctx the parse tree
     */
    enterEntityGroupExpression?: (ctx: EntityGroupExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.entityGroupExpression`.
     * @param ctx the parse tree
     */
    exitEntityGroupExpression?: (ctx: EntityGroupExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.makeGraphOperator`.
     * @param ctx the parse tree
     */
    enterMakeGraphOperator?: (ctx: MakeGraphOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.makeGraphOperator`.
     * @param ctx the parse tree
     */
    exitMakeGraphOperator?: (ctx: MakeGraphOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.makeGraphIdClause`.
     * @param ctx the parse tree
     */
    enterMakeGraphIdClause?: (ctx: MakeGraphIdClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.makeGraphIdClause`.
     * @param ctx the parse tree
     */
    exitMakeGraphIdClause?: (ctx: MakeGraphIdClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.makeGraphTablesAndKeysClause`.
     * @param ctx the parse tree
     */
    enterMakeGraphTablesAndKeysClause?: (ctx: MakeGraphTablesAndKeysClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.makeGraphTablesAndKeysClause`.
     * @param ctx the parse tree
     */
    exitMakeGraphTablesAndKeysClause?: (ctx: MakeGraphTablesAndKeysClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.makeGraphPartitionedByClause`.
     * @param ctx the parse tree
     */
    enterMakeGraphPartitionedByClause?: (ctx: MakeGraphPartitionedByClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.makeGraphPartitionedByClause`.
     * @param ctx the parse tree
     */
    exitMakeGraphPartitionedByClause?: (ctx: MakeGraphPartitionedByClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.makeSeriesOperator`.
     * @param ctx the parse tree
     */
    enterMakeSeriesOperator?: (ctx: MakeSeriesOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.makeSeriesOperator`.
     * @param ctx the parse tree
     */
    exitMakeSeriesOperator?: (ctx: MakeSeriesOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.makeSeriesOperatorOnClause`.
     * @param ctx the parse tree
     */
    enterMakeSeriesOperatorOnClause?: (ctx: MakeSeriesOperatorOnClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.makeSeriesOperatorOnClause`.
     * @param ctx the parse tree
     */
    exitMakeSeriesOperatorOnClause?: (ctx: MakeSeriesOperatorOnClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.makeSeriesOperatorAggregation`.
     * @param ctx the parse tree
     */
    enterMakeSeriesOperatorAggregation?: (ctx: MakeSeriesOperatorAggregationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.makeSeriesOperatorAggregation`.
     * @param ctx the parse tree
     */
    exitMakeSeriesOperatorAggregation?: (ctx: MakeSeriesOperatorAggregationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.makeSeriesOperatorExpressionDefaultClause`.
     * @param ctx the parse tree
     */
    enterMakeSeriesOperatorExpressionDefaultClause?: (ctx: MakeSeriesOperatorExpressionDefaultClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.makeSeriesOperatorExpressionDefaultClause`.
     * @param ctx the parse tree
     */
    exitMakeSeriesOperatorExpressionDefaultClause?: (ctx: MakeSeriesOperatorExpressionDefaultClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.makeSeriesOperatorInRangeClause`.
     * @param ctx the parse tree
     */
    enterMakeSeriesOperatorInRangeClause?: (ctx: MakeSeriesOperatorInRangeClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.makeSeriesOperatorInRangeClause`.
     * @param ctx the parse tree
     */
    exitMakeSeriesOperatorInRangeClause?: (ctx: MakeSeriesOperatorInRangeClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.makeSeriesOperatorFromToStepClause`.
     * @param ctx the parse tree
     */
    enterMakeSeriesOperatorFromToStepClause?: (ctx: MakeSeriesOperatorFromToStepClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.makeSeriesOperatorFromToStepClause`.
     * @param ctx the parse tree
     */
    exitMakeSeriesOperatorFromToStepClause?: (ctx: MakeSeriesOperatorFromToStepClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.makeSeriesOperatorByClause`.
     * @param ctx the parse tree
     */
    enterMakeSeriesOperatorByClause?: (ctx: MakeSeriesOperatorByClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.makeSeriesOperatorByClause`.
     * @param ctx the parse tree
     */
    exitMakeSeriesOperatorByClause?: (ctx: MakeSeriesOperatorByClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.mvapplyOperator`.
     * @param ctx the parse tree
     */
    enterMvapplyOperator?: (ctx: MvapplyOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.mvapplyOperator`.
     * @param ctx the parse tree
     */
    exitMvapplyOperator?: (ctx: MvapplyOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.mvapplyOperatorLimitClause`.
     * @param ctx the parse tree
     */
    enterMvapplyOperatorLimitClause?: (ctx: MvapplyOperatorLimitClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.mvapplyOperatorLimitClause`.
     * @param ctx the parse tree
     */
    exitMvapplyOperatorLimitClause?: (ctx: MvapplyOperatorLimitClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.mvapplyOperatorIdClause`.
     * @param ctx the parse tree
     */
    enterMvapplyOperatorIdClause?: (ctx: MvapplyOperatorIdClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.mvapplyOperatorIdClause`.
     * @param ctx the parse tree
     */
    exitMvapplyOperatorIdClause?: (ctx: MvapplyOperatorIdClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.mvapplyOperatorExpression`.
     * @param ctx the parse tree
     */
    enterMvapplyOperatorExpression?: (ctx: MvapplyOperatorExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.mvapplyOperatorExpression`.
     * @param ctx the parse tree
     */
    exitMvapplyOperatorExpression?: (ctx: MvapplyOperatorExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.mvapplyOperatorExpressionToClause`.
     * @param ctx the parse tree
     */
    enterMvapplyOperatorExpressionToClause?: (ctx: MvapplyOperatorExpressionToClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.mvapplyOperatorExpressionToClause`.
     * @param ctx the parse tree
     */
    exitMvapplyOperatorExpressionToClause?: (ctx: MvapplyOperatorExpressionToClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.mvexpandOperator`.
     * @param ctx the parse tree
     */
    enterMvexpandOperator?: (ctx: MvexpandOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.mvexpandOperator`.
     * @param ctx the parse tree
     */
    exitMvexpandOperator?: (ctx: MvexpandOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.mvexpandOperatorExpression`.
     * @param ctx the parse tree
     */
    enterMvexpandOperatorExpression?: (ctx: MvexpandOperatorExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.mvexpandOperatorExpression`.
     * @param ctx the parse tree
     */
    exitMvexpandOperatorExpression?: (ctx: MvexpandOperatorExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.parseOperator`.
     * @param ctx the parse tree
     */
    enterParseOperator?: (ctx: ParseOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.parseOperator`.
     * @param ctx the parse tree
     */
    exitParseOperator?: (ctx: ParseOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.parseOperatorKindClause`.
     * @param ctx the parse tree
     */
    enterParseOperatorKindClause?: (ctx: ParseOperatorKindClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.parseOperatorKindClause`.
     * @param ctx the parse tree
     */
    exitParseOperatorKindClause?: (ctx: ParseOperatorKindClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.parseOperatorFlagsClause`.
     * @param ctx the parse tree
     */
    enterParseOperatorFlagsClause?: (ctx: ParseOperatorFlagsClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.parseOperatorFlagsClause`.
     * @param ctx the parse tree
     */
    exitParseOperatorFlagsClause?: (ctx: ParseOperatorFlagsClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.parseOperatorNameAndOptionalType`.
     * @param ctx the parse tree
     */
    enterParseOperatorNameAndOptionalType?: (ctx: ParseOperatorNameAndOptionalTypeContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.parseOperatorNameAndOptionalType`.
     * @param ctx the parse tree
     */
    exitParseOperatorNameAndOptionalType?: (ctx: ParseOperatorNameAndOptionalTypeContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.parseOperatorPattern`.
     * @param ctx the parse tree
     */
    enterParseOperatorPattern?: (ctx: ParseOperatorPatternContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.parseOperatorPattern`.
     * @param ctx the parse tree
     */
    exitParseOperatorPattern?: (ctx: ParseOperatorPatternContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.parseOperatorPatternSegment`.
     * @param ctx the parse tree
     */
    enterParseOperatorPatternSegment?: (ctx: ParseOperatorPatternSegmentContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.parseOperatorPatternSegment`.
     * @param ctx the parse tree
     */
    exitParseOperatorPatternSegment?: (ctx: ParseOperatorPatternSegmentContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.parseWhereOperator`.
     * @param ctx the parse tree
     */
    enterParseWhereOperator?: (ctx: ParseWhereOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.parseWhereOperator`.
     * @param ctx the parse tree
     */
    exitParseWhereOperator?: (ctx: ParseWhereOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.parseKvOperator`.
     * @param ctx the parse tree
     */
    enterParseKvOperator?: (ctx: ParseKvOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.parseKvOperator`.
     * @param ctx the parse tree
     */
    exitParseKvOperator?: (ctx: ParseKvOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.parseKvWithClause`.
     * @param ctx the parse tree
     */
    enterParseKvWithClause?: (ctx: ParseKvWithClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.parseKvWithClause`.
     * @param ctx the parse tree
     */
    exitParseKvWithClause?: (ctx: ParseKvWithClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.partitionOperator`.
     * @param ctx the parse tree
     */
    enterPartitionOperator?: (ctx: PartitionOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.partitionOperator`.
     * @param ctx the parse tree
     */
    exitPartitionOperator?: (ctx: PartitionOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.partitionOperatorInClause`.
     * @param ctx the parse tree
     */
    enterPartitionOperatorInClause?: (ctx: PartitionOperatorInClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.partitionOperatorInClause`.
     * @param ctx the parse tree
     */
    exitPartitionOperatorInClause?: (ctx: PartitionOperatorInClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.partitionOperatorSubExpressionBody`.
     * @param ctx the parse tree
     */
    enterPartitionOperatorSubExpressionBody?: (ctx: PartitionOperatorSubExpressionBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.partitionOperatorSubExpressionBody`.
     * @param ctx the parse tree
     */
    exitPartitionOperatorSubExpressionBody?: (ctx: PartitionOperatorSubExpressionBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.partitionOperatorFullExpressionBody`.
     * @param ctx the parse tree
     */
    enterPartitionOperatorFullExpressionBody?: (ctx: PartitionOperatorFullExpressionBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.partitionOperatorFullExpressionBody`.
     * @param ctx the parse tree
     */
    exitPartitionOperatorFullExpressionBody?: (ctx: PartitionOperatorFullExpressionBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.partitionByOperator`.
     * @param ctx the parse tree
     */
    enterPartitionByOperator?: (ctx: PartitionByOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.partitionByOperator`.
     * @param ctx the parse tree
     */
    exitPartitionByOperator?: (ctx: PartitionByOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.partitionByOperatorIdClause`.
     * @param ctx the parse tree
     */
    enterPartitionByOperatorIdClause?: (ctx: PartitionByOperatorIdClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.partitionByOperatorIdClause`.
     * @param ctx the parse tree
     */
    exitPartitionByOperatorIdClause?: (ctx: PartitionByOperatorIdClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.printOperator`.
     * @param ctx the parse tree
     */
    enterPrintOperator?: (ctx: PrintOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.printOperator`.
     * @param ctx the parse tree
     */
    exitPrintOperator?: (ctx: PrintOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.projectAwayOperator`.
     * @param ctx the parse tree
     */
    enterProjectAwayOperator?: (ctx: ProjectAwayOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.projectAwayOperator`.
     * @param ctx the parse tree
     */
    exitProjectAwayOperator?: (ctx: ProjectAwayOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.projectKeepOperator`.
     * @param ctx the parse tree
     */
    enterProjectKeepOperator?: (ctx: ProjectKeepOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.projectKeepOperator`.
     * @param ctx the parse tree
     */
    exitProjectKeepOperator?: (ctx: ProjectKeepOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.projectOperator`.
     * @param ctx the parse tree
     */
    enterProjectOperator?: (ctx: ProjectOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.projectOperator`.
     * @param ctx the parse tree
     */
    exitProjectOperator?: (ctx: ProjectOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.projectRenameOperator`.
     * @param ctx the parse tree
     */
    enterProjectRenameOperator?: (ctx: ProjectRenameOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.projectRenameOperator`.
     * @param ctx the parse tree
     */
    exitProjectRenameOperator?: (ctx: ProjectRenameOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.projectReorderOperator`.
     * @param ctx the parse tree
     */
    enterProjectReorderOperator?: (ctx: ProjectReorderOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.projectReorderOperator`.
     * @param ctx the parse tree
     */
    exitProjectReorderOperator?: (ctx: ProjectReorderOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.projectReorderExpression`.
     * @param ctx the parse tree
     */
    enterProjectReorderExpression?: (ctx: ProjectReorderExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.projectReorderExpression`.
     * @param ctx the parse tree
     */
    exitProjectReorderExpression?: (ctx: ProjectReorderExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.reduceByOperator`.
     * @param ctx the parse tree
     */
    enterReduceByOperator?: (ctx: ReduceByOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.reduceByOperator`.
     * @param ctx the parse tree
     */
    exitReduceByOperator?: (ctx: ReduceByOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.reduceByWithClause`.
     * @param ctx the parse tree
     */
    enterReduceByWithClause?: (ctx: ReduceByWithClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.reduceByWithClause`.
     * @param ctx the parse tree
     */
    exitReduceByWithClause?: (ctx: ReduceByWithClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.renderOperator`.
     * @param ctx the parse tree
     */
    enterRenderOperator?: (ctx: RenderOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.renderOperator`.
     * @param ctx the parse tree
     */
    exitRenderOperator?: (ctx: RenderOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.renderOperatorWithClause`.
     * @param ctx the parse tree
     */
    enterRenderOperatorWithClause?: (ctx: RenderOperatorWithClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.renderOperatorWithClause`.
     * @param ctx the parse tree
     */
    exitRenderOperatorWithClause?: (ctx: RenderOperatorWithClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.renderOperatorLegacyPropertyList`.
     * @param ctx the parse tree
     */
    enterRenderOperatorLegacyPropertyList?: (ctx: RenderOperatorLegacyPropertyListContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.renderOperatorLegacyPropertyList`.
     * @param ctx the parse tree
     */
    exitRenderOperatorLegacyPropertyList?: (ctx: RenderOperatorLegacyPropertyListContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.renderOperatorProperty`.
     * @param ctx the parse tree
     */
    enterRenderOperatorProperty?: (ctx: RenderOperatorPropertyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.renderOperatorProperty`.
     * @param ctx the parse tree
     */
    exitRenderOperatorProperty?: (ctx: RenderOperatorPropertyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.renderPropertyNameList`.
     * @param ctx the parse tree
     */
    enterRenderPropertyNameList?: (ctx: RenderPropertyNameListContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.renderPropertyNameList`.
     * @param ctx the parse tree
     */
    exitRenderPropertyNameList?: (ctx: RenderPropertyNameListContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.renderOperatorLegacyProperty`.
     * @param ctx the parse tree
     */
    enterRenderOperatorLegacyProperty?: (ctx: RenderOperatorLegacyPropertyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.renderOperatorLegacyProperty`.
     * @param ctx the parse tree
     */
    exitRenderOperatorLegacyProperty?: (ctx: RenderOperatorLegacyPropertyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.sampleDistinctOperator`.
     * @param ctx the parse tree
     */
    enterSampleDistinctOperator?: (ctx: SampleDistinctOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.sampleDistinctOperator`.
     * @param ctx the parse tree
     */
    exitSampleDistinctOperator?: (ctx: SampleDistinctOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.sampleOperator`.
     * @param ctx the parse tree
     */
    enterSampleOperator?: (ctx: SampleOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.sampleOperator`.
     * @param ctx the parse tree
     */
    exitSampleOperator?: (ctx: SampleOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scanOperator`.
     * @param ctx the parse tree
     */
    enterScanOperator?: (ctx: ScanOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scanOperator`.
     * @param ctx the parse tree
     */
    exitScanOperator?: (ctx: ScanOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scanOperatorOrderByClause`.
     * @param ctx the parse tree
     */
    enterScanOperatorOrderByClause?: (ctx: ScanOperatorOrderByClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scanOperatorOrderByClause`.
     * @param ctx the parse tree
     */
    exitScanOperatorOrderByClause?: (ctx: ScanOperatorOrderByClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scanOperatorPartitionByClause`.
     * @param ctx the parse tree
     */
    enterScanOperatorPartitionByClause?: (ctx: ScanOperatorPartitionByClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scanOperatorPartitionByClause`.
     * @param ctx the parse tree
     */
    exitScanOperatorPartitionByClause?: (ctx: ScanOperatorPartitionByClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scanOperatorDeclareClause`.
     * @param ctx the parse tree
     */
    enterScanOperatorDeclareClause?: (ctx: ScanOperatorDeclareClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scanOperatorDeclareClause`.
     * @param ctx the parse tree
     */
    exitScanOperatorDeclareClause?: (ctx: ScanOperatorDeclareClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scanOperatorStep`.
     * @param ctx the parse tree
     */
    enterScanOperatorStep?: (ctx: ScanOperatorStepContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scanOperatorStep`.
     * @param ctx the parse tree
     */
    exitScanOperatorStep?: (ctx: ScanOperatorStepContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scanOperatorStepOutputClause`.
     * @param ctx the parse tree
     */
    enterScanOperatorStepOutputClause?: (ctx: ScanOperatorStepOutputClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scanOperatorStepOutputClause`.
     * @param ctx the parse tree
     */
    exitScanOperatorStepOutputClause?: (ctx: ScanOperatorStepOutputClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scanOperatorBody`.
     * @param ctx the parse tree
     */
    enterScanOperatorBody?: (ctx: ScanOperatorBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scanOperatorBody`.
     * @param ctx the parse tree
     */
    exitScanOperatorBody?: (ctx: ScanOperatorBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scanOperatorAssignment`.
     * @param ctx the parse tree
     */
    enterScanOperatorAssignment?: (ctx: ScanOperatorAssignmentContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scanOperatorAssignment`.
     * @param ctx the parse tree
     */
    exitScanOperatorAssignment?: (ctx: ScanOperatorAssignmentContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.searchOperator`.
     * @param ctx the parse tree
     */
    enterSearchOperator?: (ctx: SearchOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.searchOperator`.
     * @param ctx the parse tree
     */
    exitSearchOperator?: (ctx: SearchOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.searchOperatorStarAndExpression`.
     * @param ctx the parse tree
     */
    enterSearchOperatorStarAndExpression?: (ctx: SearchOperatorStarAndExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.searchOperatorStarAndExpression`.
     * @param ctx the parse tree
     */
    exitSearchOperatorStarAndExpression?: (ctx: SearchOperatorStarAndExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.searchOperatorInClause`.
     * @param ctx the parse tree
     */
    enterSearchOperatorInClause?: (ctx: SearchOperatorInClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.searchOperatorInClause`.
     * @param ctx the parse tree
     */
    exitSearchOperatorInClause?: (ctx: SearchOperatorInClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.serializeOperator`.
     * @param ctx the parse tree
     */
    enterSerializeOperator?: (ctx: SerializeOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.serializeOperator`.
     * @param ctx the parse tree
     */
    exitSerializeOperator?: (ctx: SerializeOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.sortOperator`.
     * @param ctx the parse tree
     */
    enterSortOperator?: (ctx: SortOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.sortOperator`.
     * @param ctx the parse tree
     */
    exitSortOperator?: (ctx: SortOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.orderedExpression`.
     * @param ctx the parse tree
     */
    enterOrderedExpression?: (ctx: OrderedExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.orderedExpression`.
     * @param ctx the parse tree
     */
    exitOrderedExpression?: (ctx: OrderedExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.sortOrdering`.
     * @param ctx the parse tree
     */
    enterSortOrdering?: (ctx: SortOrderingContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.sortOrdering`.
     * @param ctx the parse tree
     */
    exitSortOrdering?: (ctx: SortOrderingContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.summarizeOperator`.
     * @param ctx the parse tree
     */
    enterSummarizeOperator?: (ctx: SummarizeOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.summarizeOperator`.
     * @param ctx the parse tree
     */
    exitSummarizeOperator?: (ctx: SummarizeOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.summarizeOperatorByClause`.
     * @param ctx the parse tree
     */
    enterSummarizeOperatorByClause?: (ctx: SummarizeOperatorByClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.summarizeOperatorByClause`.
     * @param ctx the parse tree
     */
    exitSummarizeOperatorByClause?: (ctx: SummarizeOperatorByClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.summarizeOperatorLegacyBinClause`.
     * @param ctx the parse tree
     */
    enterSummarizeOperatorLegacyBinClause?: (ctx: SummarizeOperatorLegacyBinClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.summarizeOperatorLegacyBinClause`.
     * @param ctx the parse tree
     */
    exitSummarizeOperatorLegacyBinClause?: (ctx: SummarizeOperatorLegacyBinClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.takeOperator`.
     * @param ctx the parse tree
     */
    enterTakeOperator?: (ctx: TakeOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.takeOperator`.
     * @param ctx the parse tree
     */
    exitTakeOperator?: (ctx: TakeOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.topOperator`.
     * @param ctx the parse tree
     */
    enterTopOperator?: (ctx: TopOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.topOperator`.
     * @param ctx the parse tree
     */
    exitTopOperator?: (ctx: TopOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.topHittersOperator`.
     * @param ctx the parse tree
     */
    enterTopHittersOperator?: (ctx: TopHittersOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.topHittersOperator`.
     * @param ctx the parse tree
     */
    exitTopHittersOperator?: (ctx: TopHittersOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.topHittersOperatorByClause`.
     * @param ctx the parse tree
     */
    enterTopHittersOperatorByClause?: (ctx: TopHittersOperatorByClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.topHittersOperatorByClause`.
     * @param ctx the parse tree
     */
    exitTopHittersOperatorByClause?: (ctx: TopHittersOperatorByClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.topNestedOperator`.
     * @param ctx the parse tree
     */
    enterTopNestedOperator?: (ctx: TopNestedOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.topNestedOperator`.
     * @param ctx the parse tree
     */
    exitTopNestedOperator?: (ctx: TopNestedOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.topNestedOperatorPart`.
     * @param ctx the parse tree
     */
    enterTopNestedOperatorPart?: (ctx: TopNestedOperatorPartContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.topNestedOperatorPart`.
     * @param ctx the parse tree
     */
    exitTopNestedOperatorPart?: (ctx: TopNestedOperatorPartContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.topNestedOperatorWithOthersClause`.
     * @param ctx the parse tree
     */
    enterTopNestedOperatorWithOthersClause?: (ctx: TopNestedOperatorWithOthersClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.topNestedOperatorWithOthersClause`.
     * @param ctx the parse tree
     */
    exitTopNestedOperatorWithOthersClause?: (ctx: TopNestedOperatorWithOthersClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.unionOperator`.
     * @param ctx the parse tree
     */
    enterUnionOperator?: (ctx: UnionOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.unionOperator`.
     * @param ctx the parse tree
     */
    exitUnionOperator?: (ctx: UnionOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.unionOperatorExpression`.
     * @param ctx the parse tree
     */
    enterUnionOperatorExpression?: (ctx: UnionOperatorExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.unionOperatorExpression`.
     * @param ctx the parse tree
     */
    exitUnionOperatorExpression?: (ctx: UnionOperatorExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.whereOperator`.
     * @param ctx the parse tree
     */
    enterWhereOperator?: (ctx: WhereOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.whereOperator`.
     * @param ctx the parse tree
     */
    exitWhereOperator?: (ctx: WhereOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.contextualSubExpression`.
     * @param ctx the parse tree
     */
    enterContextualSubExpression?: (ctx: ContextualSubExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.contextualSubExpression`.
     * @param ctx the parse tree
     */
    exitContextualSubExpression?: (ctx: ContextualSubExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.contextualPipeExpression`.
     * @param ctx the parse tree
     */
    enterContextualPipeExpression?: (ctx: ContextualPipeExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.contextualPipeExpression`.
     * @param ctx the parse tree
     */
    exitContextualPipeExpression?: (ctx: ContextualPipeExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.contextualPipeExpressionPipedOperator`.
     * @param ctx the parse tree
     */
    enterContextualPipeExpressionPipedOperator?: (ctx: ContextualPipeExpressionPipedOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.contextualPipeExpressionPipedOperator`.
     * @param ctx the parse tree
     */
    exitContextualPipeExpressionPipedOperator?: (ctx: ContextualPipeExpressionPipedOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.strictQueryOperatorParameter`.
     * @param ctx the parse tree
     */
    enterStrictQueryOperatorParameter?: (ctx: StrictQueryOperatorParameterContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.strictQueryOperatorParameter`.
     * @param ctx the parse tree
     */
    exitStrictQueryOperatorParameter?: (ctx: StrictQueryOperatorParameterContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.relaxedQueryOperatorParameter`.
     * @param ctx the parse tree
     */
    enterRelaxedQueryOperatorParameter?: (ctx: RelaxedQueryOperatorParameterContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.relaxedQueryOperatorParameter`.
     * @param ctx the parse tree
     */
    exitRelaxedQueryOperatorParameter?: (ctx: RelaxedQueryOperatorParameterContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.queryOperatorProperty`.
     * @param ctx the parse tree
     */
    enterQueryOperatorProperty?: (ctx: QueryOperatorPropertyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.queryOperatorProperty`.
     * @param ctx the parse tree
     */
    exitQueryOperatorProperty?: (ctx: QueryOperatorPropertyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.namedExpression`.
     * @param ctx the parse tree
     */
    enterNamedExpression?: (ctx: NamedExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.namedExpression`.
     * @param ctx the parse tree
     */
    exitNamedExpression?: (ctx: NamedExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.namedExpressionNameClause`.
     * @param ctx the parse tree
     */
    enterNamedExpressionNameClause?: (ctx: NamedExpressionNameClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.namedExpressionNameClause`.
     * @param ctx the parse tree
     */
    exitNamedExpressionNameClause?: (ctx: NamedExpressionNameClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.namedExpressionNameList`.
     * @param ctx the parse tree
     */
    enterNamedExpressionNameList?: (ctx: NamedExpressionNameListContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.namedExpressionNameList`.
     * @param ctx the parse tree
     */
    exitNamedExpressionNameList?: (ctx: NamedExpressionNameListContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scopedFunctionCallExpression`.
     * @param ctx the parse tree
     */
    enterScopedFunctionCallExpression?: (ctx: ScopedFunctionCallExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scopedFunctionCallExpression`.
     * @param ctx the parse tree
     */
    exitScopedFunctionCallExpression?: (ctx: ScopedFunctionCallExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.unnamedExpression`.
     * @param ctx the parse tree
     */
    enterUnnamedExpression?: (ctx: UnnamedExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.unnamedExpression`.
     * @param ctx the parse tree
     */
    exitUnnamedExpression?: (ctx: UnnamedExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.logicalOrExpression`.
     * @param ctx the parse tree
     */
    enterLogicalOrExpression?: (ctx: LogicalOrExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.logicalOrExpression`.
     * @param ctx the parse tree
     */
    exitLogicalOrExpression?: (ctx: LogicalOrExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.logicalOrOperation`.
     * @param ctx the parse tree
     */
    enterLogicalOrOperation?: (ctx: LogicalOrOperationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.logicalOrOperation`.
     * @param ctx the parse tree
     */
    exitLogicalOrOperation?: (ctx: LogicalOrOperationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.logicalAndExpression`.
     * @param ctx the parse tree
     */
    enterLogicalAndExpression?: (ctx: LogicalAndExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.logicalAndExpression`.
     * @param ctx the parse tree
     */
    exitLogicalAndExpression?: (ctx: LogicalAndExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.logicalAndOperation`.
     * @param ctx the parse tree
     */
    enterLogicalAndOperation?: (ctx: LogicalAndOperationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.logicalAndOperation`.
     * @param ctx the parse tree
     */
    exitLogicalAndOperation?: (ctx: LogicalAndOperationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.equalityExpression`.
     * @param ctx the parse tree
     */
    enterEqualityExpression?: (ctx: EqualityExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.equalityExpression`.
     * @param ctx the parse tree
     */
    exitEqualityExpression?: (ctx: EqualityExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.equalsEqualityExpression`.
     * @param ctx the parse tree
     */
    enterEqualsEqualityExpression?: (ctx: EqualsEqualityExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.equalsEqualityExpression`.
     * @param ctx the parse tree
     */
    exitEqualsEqualityExpression?: (ctx: EqualsEqualityExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.listEqualityExpression`.
     * @param ctx the parse tree
     */
    enterListEqualityExpression?: (ctx: ListEqualityExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.listEqualityExpression`.
     * @param ctx the parse tree
     */
    exitListEqualityExpression?: (ctx: ListEqualityExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.betweenEqualityExpression`.
     * @param ctx the parse tree
     */
    enterBetweenEqualityExpression?: (ctx: BetweenEqualityExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.betweenEqualityExpression`.
     * @param ctx the parse tree
     */
    exitBetweenEqualityExpression?: (ctx: BetweenEqualityExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.starEqualityExpression`.
     * @param ctx the parse tree
     */
    enterStarEqualityExpression?: (ctx: StarEqualityExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.starEqualityExpression`.
     * @param ctx the parse tree
     */
    exitStarEqualityExpression?: (ctx: StarEqualityExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.relationalExpression`.
     * @param ctx the parse tree
     */
    enterRelationalExpression?: (ctx: RelationalExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.relationalExpression`.
     * @param ctx the parse tree
     */
    exitRelationalExpression?: (ctx: RelationalExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.additiveExpression`.
     * @param ctx the parse tree
     */
    enterAdditiveExpression?: (ctx: AdditiveExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.additiveExpression`.
     * @param ctx the parse tree
     */
    exitAdditiveExpression?: (ctx: AdditiveExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.additiveOperation`.
     * @param ctx the parse tree
     */
    enterAdditiveOperation?: (ctx: AdditiveOperationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.additiveOperation`.
     * @param ctx the parse tree
     */
    exitAdditiveOperation?: (ctx: AdditiveOperationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.multiplicativeExpression`.
     * @param ctx the parse tree
     */
    enterMultiplicativeExpression?: (ctx: MultiplicativeExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.multiplicativeExpression`.
     * @param ctx the parse tree
     */
    exitMultiplicativeExpression?: (ctx: MultiplicativeExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.multiplicativeOperation`.
     * @param ctx the parse tree
     */
    enterMultiplicativeOperation?: (ctx: MultiplicativeOperationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.multiplicativeOperation`.
     * @param ctx the parse tree
     */
    exitMultiplicativeOperation?: (ctx: MultiplicativeOperationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.stringOperatorExpression`.
     * @param ctx the parse tree
     */
    enterStringOperatorExpression?: (ctx: StringOperatorExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.stringOperatorExpression`.
     * @param ctx the parse tree
     */
    exitStringOperatorExpression?: (ctx: StringOperatorExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.stringBinaryOperatorExpression`.
     * @param ctx the parse tree
     */
    enterStringBinaryOperatorExpression?: (ctx: StringBinaryOperatorExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.stringBinaryOperatorExpression`.
     * @param ctx the parse tree
     */
    exitStringBinaryOperatorExpression?: (ctx: StringBinaryOperatorExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.stringBinaryOperation`.
     * @param ctx the parse tree
     */
    enterStringBinaryOperation?: (ctx: StringBinaryOperationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.stringBinaryOperation`.
     * @param ctx the parse tree
     */
    exitStringBinaryOperation?: (ctx: StringBinaryOperationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.stringBinaryOperator`.
     * @param ctx the parse tree
     */
    enterStringBinaryOperator?: (ctx: StringBinaryOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.stringBinaryOperator`.
     * @param ctx the parse tree
     */
    exitStringBinaryOperator?: (ctx: StringBinaryOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.stringStarOperatorExpression`.
     * @param ctx the parse tree
     */
    enterStringStarOperatorExpression?: (ctx: StringStarOperatorExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.stringStarOperatorExpression`.
     * @param ctx the parse tree
     */
    exitStringStarOperatorExpression?: (ctx: StringStarOperatorExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.invocationExpression`.
     * @param ctx the parse tree
     */
    enterInvocationExpression?: (ctx: InvocationExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.invocationExpression`.
     * @param ctx the parse tree
     */
    exitInvocationExpression?: (ctx: InvocationExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.functionCallOrPathExpression`.
     * @param ctx the parse tree
     */
    enterFunctionCallOrPathExpression?: (ctx: FunctionCallOrPathExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.functionCallOrPathExpression`.
     * @param ctx the parse tree
     */
    exitFunctionCallOrPathExpression?: (ctx: FunctionCallOrPathExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.functionCallOrPathRoot`.
     * @param ctx the parse tree
     */
    enterFunctionCallOrPathRoot?: (ctx: FunctionCallOrPathRootContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.functionCallOrPathRoot`.
     * @param ctx the parse tree
     */
    exitFunctionCallOrPathRoot?: (ctx: FunctionCallOrPathRootContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.functionCallOrPathPathExpression`.
     * @param ctx the parse tree
     */
    enterFunctionCallOrPathPathExpression?: (ctx: FunctionCallOrPathPathExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.functionCallOrPathPathExpression`.
     * @param ctx the parse tree
     */
    exitFunctionCallOrPathPathExpression?: (ctx: FunctionCallOrPathPathExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.functionCallOrPathOperation`.
     * @param ctx the parse tree
     */
    enterFunctionCallOrPathOperation?: (ctx: FunctionCallOrPathOperationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.functionCallOrPathOperation`.
     * @param ctx the parse tree
     */
    exitFunctionCallOrPathOperation?: (ctx: FunctionCallOrPathOperationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.functionCallOrPathPathOperation`.
     * @param ctx the parse tree
     */
    enterFunctionCallOrPathPathOperation?: (ctx: FunctionCallOrPathPathOperationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.functionCallOrPathPathOperation`.
     * @param ctx the parse tree
     */
    exitFunctionCallOrPathPathOperation?: (ctx: FunctionCallOrPathPathOperationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.functionCallOrPathElementOperation`.
     * @param ctx the parse tree
     */
    enterFunctionCallOrPathElementOperation?: (ctx: FunctionCallOrPathElementOperationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.functionCallOrPathElementOperation`.
     * @param ctx the parse tree
     */
    exitFunctionCallOrPathElementOperation?: (ctx: FunctionCallOrPathElementOperationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.legacyFunctionCallOrPathElementOperation`.
     * @param ctx the parse tree
     */
    enterLegacyFunctionCallOrPathElementOperation?: (ctx: LegacyFunctionCallOrPathElementOperationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.legacyFunctionCallOrPathElementOperation`.
     * @param ctx the parse tree
     */
    exitLegacyFunctionCallOrPathElementOperation?: (ctx: LegacyFunctionCallOrPathElementOperationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.toScalarExpression`.
     * @param ctx the parse tree
     */
    enterToScalarExpression?: (ctx: ToScalarExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.toScalarExpression`.
     * @param ctx the parse tree
     */
    exitToScalarExpression?: (ctx: ToScalarExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.toTableExpression`.
     * @param ctx the parse tree
     */
    enterToTableExpression?: (ctx: ToTableExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.toTableExpression`.
     * @param ctx the parse tree
     */
    exitToTableExpression?: (ctx: ToTableExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.noOptimizationParameter`.
     * @param ctx the parse tree
     */
    enterNoOptimizationParameter?: (ctx: NoOptimizationParameterContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.noOptimizationParameter`.
     * @param ctx the parse tree
     */
    exitNoOptimizationParameter?: (ctx: NoOptimizationParameterContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.dotCompositeFunctionCallExpression`.
     * @param ctx the parse tree
     */
    enterDotCompositeFunctionCallExpression?: (ctx: DotCompositeFunctionCallExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.dotCompositeFunctionCallExpression`.
     * @param ctx the parse tree
     */
    exitDotCompositeFunctionCallExpression?: (ctx: DotCompositeFunctionCallExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.dotCompositeFunctionCallOperation`.
     * @param ctx the parse tree
     */
    enterDotCompositeFunctionCallOperation?: (ctx: DotCompositeFunctionCallOperationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.dotCompositeFunctionCallOperation`.
     * @param ctx the parse tree
     */
    exitDotCompositeFunctionCallOperation?: (ctx: DotCompositeFunctionCallOperationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.functionCallExpression`.
     * @param ctx the parse tree
     */
    enterFunctionCallExpression?: (ctx: FunctionCallExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.functionCallExpression`.
     * @param ctx the parse tree
     */
    exitFunctionCallExpression?: (ctx: FunctionCallExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.namedFunctionCallExpression`.
     * @param ctx the parse tree
     */
    enterNamedFunctionCallExpression?: (ctx: NamedFunctionCallExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.namedFunctionCallExpression`.
     * @param ctx the parse tree
     */
    exitNamedFunctionCallExpression?: (ctx: NamedFunctionCallExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.argumentExpression`.
     * @param ctx the parse tree
     */
    enterArgumentExpression?: (ctx: ArgumentExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.argumentExpression`.
     * @param ctx the parse tree
     */
    exitArgumentExpression?: (ctx: ArgumentExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.countExpression`.
     * @param ctx the parse tree
     */
    enterCountExpression?: (ctx: CountExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.countExpression`.
     * @param ctx the parse tree
     */
    exitCountExpression?: (ctx: CountExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.starExpression`.
     * @param ctx the parse tree
     */
    enterStarExpression?: (ctx: StarExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.starExpression`.
     * @param ctx the parse tree
     */
    exitStarExpression?: (ctx: StarExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.primaryExpression`.
     * @param ctx the parse tree
     */
    enterPrimaryExpression?: (ctx: PrimaryExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.primaryExpression`.
     * @param ctx the parse tree
     */
    exitPrimaryExpression?: (ctx: PrimaryExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.nameReferenceWithDataScope`.
     * @param ctx the parse tree
     */
    enterNameReferenceWithDataScope?: (ctx: NameReferenceWithDataScopeContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.nameReferenceWithDataScope`.
     * @param ctx the parse tree
     */
    exitNameReferenceWithDataScope?: (ctx: NameReferenceWithDataScopeContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.dataScopeClause`.
     * @param ctx the parse tree
     */
    enterDataScopeClause?: (ctx: DataScopeClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.dataScopeClause`.
     * @param ctx the parse tree
     */
    exitDataScopeClause?: (ctx: DataScopeClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.parenthesizedExpression`.
     * @param ctx the parse tree
     */
    enterParenthesizedExpression?: (ctx: ParenthesizedExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.parenthesizedExpression`.
     * @param ctx the parse tree
     */
    exitParenthesizedExpression?: (ctx: ParenthesizedExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.rangeExpression`.
     * @param ctx the parse tree
     */
    enterRangeExpression?: (ctx: RangeExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.rangeExpression`.
     * @param ctx the parse tree
     */
    exitRangeExpression?: (ctx: RangeExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.entityExpression`.
     * @param ctx the parse tree
     */
    enterEntityExpression?: (ctx: EntityExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.entityExpression`.
     * @param ctx the parse tree
     */
    exitEntityExpression?: (ctx: EntityExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.entityPathOrElementExpression`.
     * @param ctx the parse tree
     */
    enterEntityPathOrElementExpression?: (ctx: EntityPathOrElementExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.entityPathOrElementExpression`.
     * @param ctx the parse tree
     */
    exitEntityPathOrElementExpression?: (ctx: EntityPathOrElementExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.entityPathOrElementOperator`.
     * @param ctx the parse tree
     */
    enterEntityPathOrElementOperator?: (ctx: EntityPathOrElementOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.entityPathOrElementOperator`.
     * @param ctx the parse tree
     */
    exitEntityPathOrElementOperator?: (ctx: EntityPathOrElementOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.entityPathOperator`.
     * @param ctx the parse tree
     */
    enterEntityPathOperator?: (ctx: EntityPathOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.entityPathOperator`.
     * @param ctx the parse tree
     */
    exitEntityPathOperator?: (ctx: EntityPathOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.entityElementOperator`.
     * @param ctx the parse tree
     */
    enterEntityElementOperator?: (ctx: EntityElementOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.entityElementOperator`.
     * @param ctx the parse tree
     */
    exitEntityElementOperator?: (ctx: EntityElementOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.legacyEntityPathElementOperator`.
     * @param ctx the parse tree
     */
    enterLegacyEntityPathElementOperator?: (ctx: LegacyEntityPathElementOperatorContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.legacyEntityPathElementOperator`.
     * @param ctx the parse tree
     */
    exitLegacyEntityPathElementOperator?: (ctx: LegacyEntityPathElementOperatorContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.entityName`.
     * @param ctx the parse tree
     */
    enterEntityName?: (ctx: EntityNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.entityName`.
     * @param ctx the parse tree
     */
    exitEntityName?: (ctx: EntityNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.entityNameReference`.
     * @param ctx the parse tree
     */
    enterEntityNameReference?: (ctx: EntityNameReferenceContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.entityNameReference`.
     * @param ctx the parse tree
     */
    exitEntityNameReference?: (ctx: EntityNameReferenceContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.atSignName`.
     * @param ctx the parse tree
     */
    enterAtSignName?: (ctx: AtSignNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.atSignName`.
     * @param ctx the parse tree
     */
    exitAtSignName?: (ctx: AtSignNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.extendedPathName`.
     * @param ctx the parse tree
     */
    enterExtendedPathName?: (ctx: ExtendedPathNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.extendedPathName`.
     * @param ctx the parse tree
     */
    exitExtendedPathName?: (ctx: ExtendedPathNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.wildcardedEntityExpression`.
     * @param ctx the parse tree
     */
    enterWildcardedEntityExpression?: (ctx: WildcardedEntityExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.wildcardedEntityExpression`.
     * @param ctx the parse tree
     */
    exitWildcardedEntityExpression?: (ctx: WildcardedEntityExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.wildcardedPathExpression`.
     * @param ctx the parse tree
     */
    enterWildcardedPathExpression?: (ctx: WildcardedPathExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.wildcardedPathExpression`.
     * @param ctx the parse tree
     */
    exitWildcardedPathExpression?: (ctx: WildcardedPathExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.wildcardedPathName`.
     * @param ctx the parse tree
     */
    enterWildcardedPathName?: (ctx: WildcardedPathNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.wildcardedPathName`.
     * @param ctx the parse tree
     */
    exitWildcardedPathName?: (ctx: WildcardedPathNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.contextualDataTableExpression`.
     * @param ctx the parse tree
     */
    enterContextualDataTableExpression?: (ctx: ContextualDataTableExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.contextualDataTableExpression`.
     * @param ctx the parse tree
     */
    exitContextualDataTableExpression?: (ctx: ContextualDataTableExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.dataTableExpression`.
     * @param ctx the parse tree
     */
    enterDataTableExpression?: (ctx: DataTableExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.dataTableExpression`.
     * @param ctx the parse tree
     */
    exitDataTableExpression?: (ctx: DataTableExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.rowSchema`.
     * @param ctx the parse tree
     */
    enterRowSchema?: (ctx: RowSchemaContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.rowSchema`.
     * @param ctx the parse tree
     */
    exitRowSchema?: (ctx: RowSchemaContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.rowSchemaColumnDeclaration`.
     * @param ctx the parse tree
     */
    enterRowSchemaColumnDeclaration?: (ctx: RowSchemaColumnDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.rowSchemaColumnDeclaration`.
     * @param ctx the parse tree
     */
    exitRowSchemaColumnDeclaration?: (ctx: RowSchemaColumnDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.externalDataExpression`.
     * @param ctx the parse tree
     */
    enterExternalDataExpression?: (ctx: ExternalDataExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.externalDataExpression`.
     * @param ctx the parse tree
     */
    exitExternalDataExpression?: (ctx: ExternalDataExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.externalDataWithClause`.
     * @param ctx the parse tree
     */
    enterExternalDataWithClause?: (ctx: ExternalDataWithClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.externalDataWithClause`.
     * @param ctx the parse tree
     */
    exitExternalDataWithClause?: (ctx: ExternalDataWithClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.externalDataWithClauseProperty`.
     * @param ctx the parse tree
     */
    enterExternalDataWithClauseProperty?: (ctx: ExternalDataWithClausePropertyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.externalDataWithClauseProperty`.
     * @param ctx the parse tree
     */
    exitExternalDataWithClauseProperty?: (ctx: ExternalDataWithClausePropertyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.materializedViewCombineExpression`.
     * @param ctx the parse tree
     */
    enterMaterializedViewCombineExpression?: (ctx: MaterializedViewCombineExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.materializedViewCombineExpression`.
     * @param ctx the parse tree
     */
    exitMaterializedViewCombineExpression?: (ctx: MaterializedViewCombineExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.materializeViewCombineBaseClause`.
     * @param ctx the parse tree
     */
    enterMaterializeViewCombineBaseClause?: (ctx: MaterializeViewCombineBaseClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.materializeViewCombineBaseClause`.
     * @param ctx the parse tree
     */
    exitMaterializeViewCombineBaseClause?: (ctx: MaterializeViewCombineBaseClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.materializedViewCombineDeltaClause`.
     * @param ctx the parse tree
     */
    enterMaterializedViewCombineDeltaClause?: (ctx: MaterializedViewCombineDeltaClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.materializedViewCombineDeltaClause`.
     * @param ctx the parse tree
     */
    exitMaterializedViewCombineDeltaClause?: (ctx: MaterializedViewCombineDeltaClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.materializedViewCombineAggregationsClause`.
     * @param ctx the parse tree
     */
    enterMaterializedViewCombineAggregationsClause?: (ctx: MaterializedViewCombineAggregationsClauseContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.materializedViewCombineAggregationsClause`.
     * @param ctx the parse tree
     */
    exitMaterializedViewCombineAggregationsClause?: (ctx: MaterializedViewCombineAggregationsClauseContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.scalarType`.
     * @param ctx the parse tree
     */
    enterScalarType?: (ctx: ScalarTypeContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.scalarType`.
     * @param ctx the parse tree
     */
    exitScalarType?: (ctx: ScalarTypeContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.extendedScalarType`.
     * @param ctx the parse tree
     */
    enterExtendedScalarType?: (ctx: ExtendedScalarTypeContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.extendedScalarType`.
     * @param ctx the parse tree
     */
    exitExtendedScalarType?: (ctx: ExtendedScalarTypeContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.parameterName`.
     * @param ctx the parse tree
     */
    enterParameterName?: (ctx: ParameterNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.parameterName`.
     * @param ctx the parse tree
     */
    exitParameterName?: (ctx: ParameterNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.simpleNameReference`.
     * @param ctx the parse tree
     */
    enterSimpleNameReference?: (ctx: SimpleNameReferenceContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.simpleNameReference`.
     * @param ctx the parse tree
     */
    exitSimpleNameReference?: (ctx: SimpleNameReferenceContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.extendedNameReference`.
     * @param ctx the parse tree
     */
    enterExtendedNameReference?: (ctx: ExtendedNameReferenceContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.extendedNameReference`.
     * @param ctx the parse tree
     */
    exitExtendedNameReference?: (ctx: ExtendedNameReferenceContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.wildcardedNameReference`.
     * @param ctx the parse tree
     */
    enterWildcardedNameReference?: (ctx: WildcardedNameReferenceContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.wildcardedNameReference`.
     * @param ctx the parse tree
     */
    exitWildcardedNameReference?: (ctx: WildcardedNameReferenceContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.simpleOrWildcardedNameReference`.
     * @param ctx the parse tree
     */
    enterSimpleOrWildcardedNameReference?: (ctx: SimpleOrWildcardedNameReferenceContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.simpleOrWildcardedNameReference`.
     * @param ctx the parse tree
     */
    exitSimpleOrWildcardedNameReference?: (ctx: SimpleOrWildcardedNameReferenceContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.identifierName`.
     * @param ctx the parse tree
     */
    enterIdentifierName?: (ctx: IdentifierNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.identifierName`.
     * @param ctx the parse tree
     */
    exitIdentifierName?: (ctx: IdentifierNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.keywordName`.
     * @param ctx the parse tree
     */
    enterKeywordName?: (ctx: KeywordNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.keywordName`.
     * @param ctx the parse tree
     */
    exitKeywordName?: (ctx: KeywordNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.extendedKeywordName`.
     * @param ctx the parse tree
     */
    enterExtendedKeywordName?: (ctx: ExtendedKeywordNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.extendedKeywordName`.
     * @param ctx the parse tree
     */
    exitExtendedKeywordName?: (ctx: ExtendedKeywordNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.escapedName`.
     * @param ctx the parse tree
     */
    enterEscapedName?: (ctx: EscapedNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.escapedName`.
     * @param ctx the parse tree
     */
    exitEscapedName?: (ctx: EscapedNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.identifierOrKeywordName`.
     * @param ctx the parse tree
     */
    enterIdentifierOrKeywordName?: (ctx: IdentifierOrKeywordNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.identifierOrKeywordName`.
     * @param ctx the parse tree
     */
    exitIdentifierOrKeywordName?: (ctx: IdentifierOrKeywordNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.identifierOrKeywordOrEscapedName`.
     * @param ctx the parse tree
     */
    enterIdentifierOrKeywordOrEscapedName?: (ctx: IdentifierOrKeywordOrEscapedNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.identifierOrKeywordOrEscapedName`.
     * @param ctx the parse tree
     */
    exitIdentifierOrKeywordOrEscapedName?: (ctx: IdentifierOrKeywordOrEscapedNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.identifierOrExtendedKeywordOrEscapedName`.
     * @param ctx the parse tree
     */
    enterIdentifierOrExtendedKeywordOrEscapedName?: (ctx: IdentifierOrExtendedKeywordOrEscapedNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.identifierOrExtendedKeywordOrEscapedName`.
     * @param ctx the parse tree
     */
    exitIdentifierOrExtendedKeywordOrEscapedName?: (ctx: IdentifierOrExtendedKeywordOrEscapedNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.identifierOrExtendedKeywordName`.
     * @param ctx the parse tree
     */
    enterIdentifierOrExtendedKeywordName?: (ctx: IdentifierOrExtendedKeywordNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.identifierOrExtendedKeywordName`.
     * @param ctx the parse tree
     */
    exitIdentifierOrExtendedKeywordName?: (ctx: IdentifierOrExtendedKeywordNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.wildcardedName`.
     * @param ctx the parse tree
     */
    enterWildcardedName?: (ctx: WildcardedNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.wildcardedName`.
     * @param ctx the parse tree
     */
    exitWildcardedName?: (ctx: WildcardedNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.wildcardedNamePrefix`.
     * @param ctx the parse tree
     */
    enterWildcardedNamePrefix?: (ctx: WildcardedNamePrefixContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.wildcardedNamePrefix`.
     * @param ctx the parse tree
     */
    exitWildcardedNamePrefix?: (ctx: WildcardedNamePrefixContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.wildcardedNameSegment`.
     * @param ctx the parse tree
     */
    enterWildcardedNameSegment?: (ctx: WildcardedNameSegmentContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.wildcardedNameSegment`.
     * @param ctx the parse tree
     */
    exitWildcardedNameSegment?: (ctx: WildcardedNameSegmentContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.literalExpression`.
     * @param ctx the parse tree
     */
    enterLiteralExpression?: (ctx: LiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.literalExpression`.
     * @param ctx the parse tree
     */
    exitLiteralExpression?: (ctx: LiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.unsignedLiteralExpression`.
     * @param ctx the parse tree
     */
    enterUnsignedLiteralExpression?: (ctx: UnsignedLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.unsignedLiteralExpression`.
     * @param ctx the parse tree
     */
    exitUnsignedLiteralExpression?: (ctx: UnsignedLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.numberLikeLiteralExpression`.
     * @param ctx the parse tree
     */
    enterNumberLikeLiteralExpression?: (ctx: NumberLikeLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.numberLikeLiteralExpression`.
     * @param ctx the parse tree
     */
    exitNumberLikeLiteralExpression?: (ctx: NumberLikeLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.numericLiteralExpression`.
     * @param ctx the parse tree
     */
    enterNumericLiteralExpression?: (ctx: NumericLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.numericLiteralExpression`.
     * @param ctx the parse tree
     */
    exitNumericLiteralExpression?: (ctx: NumericLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.signedLiteralExpression`.
     * @param ctx the parse tree
     */
    enterSignedLiteralExpression?: (ctx: SignedLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.signedLiteralExpression`.
     * @param ctx the parse tree
     */
    exitSignedLiteralExpression?: (ctx: SignedLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.longLiteralExpression`.
     * @param ctx the parse tree
     */
    enterLongLiteralExpression?: (ctx: LongLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.longLiteralExpression`.
     * @param ctx the parse tree
     */
    exitLongLiteralExpression?: (ctx: LongLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.intLiteralExpression`.
     * @param ctx the parse tree
     */
    enterIntLiteralExpression?: (ctx: IntLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.intLiteralExpression`.
     * @param ctx the parse tree
     */
    exitIntLiteralExpression?: (ctx: IntLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.realLiteralExpression`.
     * @param ctx the parse tree
     */
    enterRealLiteralExpression?: (ctx: RealLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.realLiteralExpression`.
     * @param ctx the parse tree
     */
    exitRealLiteralExpression?: (ctx: RealLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.decimalLiteralExpression`.
     * @param ctx the parse tree
     */
    enterDecimalLiteralExpression?: (ctx: DecimalLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.decimalLiteralExpression`.
     * @param ctx the parse tree
     */
    exitDecimalLiteralExpression?: (ctx: DecimalLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.dateTimeLiteralExpression`.
     * @param ctx the parse tree
     */
    enterDateTimeLiteralExpression?: (ctx: DateTimeLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.dateTimeLiteralExpression`.
     * @param ctx the parse tree
     */
    exitDateTimeLiteralExpression?: (ctx: DateTimeLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.timeSpanLiteralExpression`.
     * @param ctx the parse tree
     */
    enterTimeSpanLiteralExpression?: (ctx: TimeSpanLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.timeSpanLiteralExpression`.
     * @param ctx the parse tree
     */
    exitTimeSpanLiteralExpression?: (ctx: TimeSpanLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.booleanLiteralExpression`.
     * @param ctx the parse tree
     */
    enterBooleanLiteralExpression?: (ctx: BooleanLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.booleanLiteralExpression`.
     * @param ctx the parse tree
     */
    exitBooleanLiteralExpression?: (ctx: BooleanLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.guidLiteralExpression`.
     * @param ctx the parse tree
     */
    enterGuidLiteralExpression?: (ctx: GuidLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.guidLiteralExpression`.
     * @param ctx the parse tree
     */
    exitGuidLiteralExpression?: (ctx: GuidLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.typeLiteralExpression`.
     * @param ctx the parse tree
     */
    enterTypeLiteralExpression?: (ctx: TypeLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.typeLiteralExpression`.
     * @param ctx the parse tree
     */
    exitTypeLiteralExpression?: (ctx: TypeLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.signedLongLiteralExpression`.
     * @param ctx the parse tree
     */
    enterSignedLongLiteralExpression?: (ctx: SignedLongLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.signedLongLiteralExpression`.
     * @param ctx the parse tree
     */
    exitSignedLongLiteralExpression?: (ctx: SignedLongLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.signedRealLiteralExpression`.
     * @param ctx the parse tree
     */
    enterSignedRealLiteralExpression?: (ctx: SignedRealLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.signedRealLiteralExpression`.
     * @param ctx the parse tree
     */
    exitSignedRealLiteralExpression?: (ctx: SignedRealLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.stringLiteralExpression`.
     * @param ctx the parse tree
     */
    enterStringLiteralExpression?: (ctx: StringLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.stringLiteralExpression`.
     * @param ctx the parse tree
     */
    exitStringLiteralExpression?: (ctx: StringLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.dynamicLiteralExpression`.
     * @param ctx the parse tree
     */
    enterDynamicLiteralExpression?: (ctx: DynamicLiteralExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.dynamicLiteralExpression`.
     * @param ctx the parse tree
     */
    exitDynamicLiteralExpression?: (ctx: DynamicLiteralExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonValue`.
     * @param ctx the parse tree
     */
    enterJsonValue?: (ctx: JsonValueContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonValue`.
     * @param ctx the parse tree
     */
    exitJsonValue?: (ctx: JsonValueContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonObject`.
     * @param ctx the parse tree
     */
    enterJsonObject?: (ctx: JsonObjectContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonObject`.
     * @param ctx the parse tree
     */
    exitJsonObject?: (ctx: JsonObjectContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonPair`.
     * @param ctx the parse tree
     */
    enterJsonPair?: (ctx: JsonPairContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonPair`.
     * @param ctx the parse tree
     */
    exitJsonPair?: (ctx: JsonPairContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonArray`.
     * @param ctx the parse tree
     */
    enterJsonArray?: (ctx: JsonArrayContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonArray`.
     * @param ctx the parse tree
     */
    exitJsonArray?: (ctx: JsonArrayContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonBoolean`.
     * @param ctx the parse tree
     */
    enterJsonBoolean?: (ctx: JsonBooleanContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonBoolean`.
     * @param ctx the parse tree
     */
    exitJsonBoolean?: (ctx: JsonBooleanContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonDateTime`.
     * @param ctx the parse tree
     */
    enterJsonDateTime?: (ctx: JsonDateTimeContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonDateTime`.
     * @param ctx the parse tree
     */
    exitJsonDateTime?: (ctx: JsonDateTimeContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonGuid`.
     * @param ctx the parse tree
     */
    enterJsonGuid?: (ctx: JsonGuidContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonGuid`.
     * @param ctx the parse tree
     */
    exitJsonGuid?: (ctx: JsonGuidContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonNull`.
     * @param ctx the parse tree
     */
    enterJsonNull?: (ctx: JsonNullContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonNull`.
     * @param ctx the parse tree
     */
    exitJsonNull?: (ctx: JsonNullContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonString`.
     * @param ctx the parse tree
     */
    enterJsonString?: (ctx: JsonStringContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonString`.
     * @param ctx the parse tree
     */
    exitJsonString?: (ctx: JsonStringContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonTimeSpan`.
     * @param ctx the parse tree
     */
    enterJsonTimeSpan?: (ctx: JsonTimeSpanContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonTimeSpan`.
     * @param ctx the parse tree
     */
    exitJsonTimeSpan?: (ctx: JsonTimeSpanContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonLong`.
     * @param ctx the parse tree
     */
    enterJsonLong?: (ctx: JsonLongContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonLong`.
     * @param ctx the parse tree
     */
    exitJsonLong?: (ctx: JsonLongContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.jsonReal`.
     * @param ctx the parse tree
     */
    enterJsonReal?: (ctx: JsonRealContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.jsonReal`.
     * @param ctx the parse tree
     */
    exitJsonReal?: (ctx: JsonRealContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementCommandExpression`.
     * @param ctx the parse tree
     */
    enterManagementCommandExpression?: (ctx: ManagementCommandExpressionContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementCommandExpression`.
     * @param ctx the parse tree
     */
    exitManagementCommandExpression?: (ctx: ManagementCommandExpressionContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementCommandBody`.
     * @param ctx the parse tree
     */
    enterManagementCommandBody?: (ctx: ManagementCommandBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementCommandBody`.
     * @param ctx the parse tree
     */
    exitManagementCommandBody?: (ctx: ManagementCommandBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementTableWithSchemaBody`.
     * @param ctx the parse tree
     */
    enterManagementTableWithSchemaBody?: (ctx: ManagementTableWithSchemaBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementTableWithSchemaBody`.
     * @param ctx the parse tree
     */
    exitManagementTableWithSchemaBody?: (ctx: ManagementTableWithSchemaBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementSchemaText`.
     * @param ctx the parse tree
     */
    enterManagementSchemaText?: (ctx: ManagementSchemaTextContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementSchemaText`.
     * @param ctx the parse tree
     */
    exitManagementSchemaText?: (ctx: ManagementSchemaTextContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementSchemaToken`.
     * @param ctx the parse tree
     */
    enterManagementSchemaToken?: (ctx: ManagementSchemaTokenContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementSchemaToken`.
     * @param ctx the parse tree
     */
    exitManagementSchemaToken?: (ctx: ManagementSchemaTokenContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementTableTargetBody`.
     * @param ctx the parse tree
     */
    enterManagementTableTargetBody?: (ctx: ManagementTableTargetBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementTableTargetBody`.
     * @param ctx the parse tree
     */
    exitManagementTableTargetBody?: (ctx: ManagementTableTargetBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementDropTableBody`.
     * @param ctx the parse tree
     */
    enterManagementDropTableBody?: (ctx: ManagementDropTableBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementDropTableBody`.
     * @param ctx the parse tree
     */
    exitManagementDropTableBody?: (ctx: ManagementDropTableBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementShowBody`.
     * @param ctx the parse tree
     */
    enterManagementShowBody?: (ctx: ManagementShowBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementShowBody`.
     * @param ctx the parse tree
     */
    exitManagementShowBody?: (ctx: ManagementShowBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementIngestInlineBody`.
     * @param ctx the parse tree
     */
    enterManagementIngestInlineBody?: (ctx: ManagementIngestInlineBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementIngestInlineBody`.
     * @param ctx the parse tree
     */
    exitManagementIngestInlineBody?: (ctx: ManagementIngestInlineBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementIngestFromUriBody`.
     * @param ctx the parse tree
     */
    enterManagementIngestFromUriBody?: (ctx: ManagementIngestFromUriBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementIngestFromUriBody`.
     * @param ctx the parse tree
     */
    exitManagementIngestFromUriBody?: (ctx: ManagementIngestFromUriBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementIngestInlineProperties`.
     * @param ctx the parse tree
     */
    enterManagementIngestInlineProperties?: (ctx: ManagementIngestInlinePropertiesContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementIngestInlineProperties`.
     * @param ctx the parse tree
     */
    exitManagementIngestInlineProperties?: (ctx: ManagementIngestInlinePropertiesContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementIngestInlinePropertyToken`.
     * @param ctx the parse tree
     */
    enterManagementIngestInlinePropertyToken?: (ctx: ManagementIngestInlinePropertyTokenContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementIngestInlinePropertyToken`.
     * @param ctx the parse tree
     */
    exitManagementIngestInlinePropertyToken?: (ctx: ManagementIngestInlinePropertyTokenContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementIngestSourceText`.
     * @param ctx the parse tree
     */
    enterManagementIngestSourceText?: (ctx: ManagementIngestSourceTextContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementIngestSourceText`.
     * @param ctx the parse tree
     */
    exitManagementIngestSourceText?: (ctx: ManagementIngestSourceTextContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementIngestSourceToken`.
     * @param ctx the parse tree
     */
    enterManagementIngestSourceToken?: (ctx: ManagementIngestSourceTokenContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementIngestSourceToken`.
     * @param ctx the parse tree
     */
    exitManagementIngestSourceToken?: (ctx: ManagementIngestSourceTokenContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementFromQueryPayload`.
     * @param ctx the parse tree
     */
    enterManagementFromQueryPayload?: (ctx: ManagementFromQueryPayloadContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementFromQueryPayload`.
     * @param ctx the parse tree
     */
    exitManagementFromQueryPayload?: (ctx: ManagementFromQueryPayloadContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementGenericBody`.
     * @param ctx the parse tree
     */
    enterManagementGenericBody?: (ctx: ManagementGenericBodyContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementGenericBody`.
     * @param ctx the parse tree
     */
    exitManagementGenericBody?: (ctx: ManagementGenericBodyContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementCommandName`.
     * @param ctx the parse tree
     */
    enterManagementCommandName?: (ctx: ManagementCommandNameContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementCommandName`.
     * @param ctx the parse tree
     */
    exitManagementCommandName?: (ctx: ManagementCommandNameContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementCommandNameSegment`.
     * @param ctx the parse tree
     */
    enterManagementCommandNameSegment?: (ctx: ManagementCommandNameSegmentContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementCommandNameSegment`.
     * @param ctx the parse tree
     */
    exitManagementCommandNameSegment?: (ctx: ManagementCommandNameSegmentContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementCommandIdentifier`.
     * @param ctx the parse tree
     */
    enterManagementCommandIdentifier?: (ctx: ManagementCommandIdentifierContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementCommandIdentifier`.
     * @param ctx the parse tree
     */
    exitManagementCommandIdentifier?: (ctx: ManagementCommandIdentifierContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementCommandToken`.
     * @param ctx the parse tree
     */
    enterManagementCommandToken?: (ctx: ManagementCommandTokenContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementCommandToken`.
     * @param ctx the parse tree
     */
    exitManagementCommandToken?: (ctx: ManagementCommandTokenContext) => void;
    /**
     * Enter a parse tree produced by `KqlParser.managementCommandQueryToken`.
     * @param ctx the parse tree
     */
    enterManagementCommandQueryToken?: (ctx: ManagementCommandQueryTokenContext) => void;
    /**
     * Exit a parse tree produced by `KqlParser.managementCommandQueryToken`.
     * @param ctx the parse tree
     */
    exitManagementCommandQueryToken?: (ctx: ManagementCommandQueryTokenContext) => void;

    visitTerminal(node: TerminalNode): void {}
    visitErrorNode(node: ErrorNode): void {}
    enterEveryRule(node: ParserRuleContext): void {}
    exitEveryRule(node: ParserRuleContext): void {}
}

