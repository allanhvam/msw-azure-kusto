
import { AbstractParseTreeVisitor } from "antlr4ng";


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
 * This interface defines a complete generic visitor for a parse tree produced
 * by `KqlParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class KqlVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `KqlParser.top`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTop?: (ctx: TopContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.query`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQuery?: (ctx: QueryContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatement?: (ctx: StatementContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.aliasDatabaseStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAliasDatabaseStatement?: (ctx: AliasDatabaseStatementContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.letStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetStatement?: (ctx: LetStatementContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.letVariableDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetVariableDeclaration?: (ctx: LetVariableDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.letFunctionDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetFunctionDeclaration?: (ctx: LetFunctionDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.letViewDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetViewDeclaration?: (ctx: LetViewDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.letViewParameterList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetViewParameterList?: (ctx: LetViewParameterListContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.letMaterializeDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetMaterializeDeclaration?: (ctx: LetMaterializeDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.letEntityGroupDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetEntityGroupDeclaration?: (ctx: LetEntityGroupDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.letFunctionParameterList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetFunctionParameterList?: (ctx: LetFunctionParameterListContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scalarParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScalarParameter?: (ctx: ScalarParameterContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scalarParameterDefault`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScalarParameterDefault?: (ctx: ScalarParameterDefaultContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.tabularParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTabularParameter?: (ctx: TabularParameterContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.tabularParameterOpenSchema`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTabularParameterOpenSchema?: (ctx: TabularParameterOpenSchemaContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.tabularParameterRowSchema`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTabularParameterRowSchema?: (ctx: TabularParameterRowSchemaContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.tabularParameterRowSchemaColumnDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTabularParameterRowSchemaColumnDeclaration?: (ctx: TabularParameterRowSchemaColumnDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.letFunctionBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetFunctionBody?: (ctx: LetFunctionBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.letFunctionBodyStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetFunctionBodyStatement?: (ctx: LetFunctionBodyStatementContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declarePatternStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclarePatternStatement?: (ctx: DeclarePatternStatementContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declarePatternDefinition`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclarePatternDefinition?: (ctx: DeclarePatternDefinitionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declarePatternParameterList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclarePatternParameterList?: (ctx: DeclarePatternParameterListContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declarePatternParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclarePatternParameter?: (ctx: DeclarePatternParameterContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declarePatternPathParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclarePatternPathParameter?: (ctx: DeclarePatternPathParameterContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declarePatternRule`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclarePatternRule?: (ctx: DeclarePatternRuleContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declarePatternRuleArgumentList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclarePatternRuleArgumentList?: (ctx: DeclarePatternRuleArgumentListContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declarePatternRulePathArgument`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclarePatternRulePathArgument?: (ctx: DeclarePatternRulePathArgumentContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declarePatternRuleArgument`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclarePatternRuleArgument?: (ctx: DeclarePatternRuleArgumentContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declarePatternBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclarePatternBody?: (ctx: DeclarePatternBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.restrictAccessStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRestrictAccessStatement?: (ctx: RestrictAccessStatementContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.restrictAccessStatementEntity`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRestrictAccessStatementEntity?: (ctx: RestrictAccessStatementEntityContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.setStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetStatement?: (ctx: SetStatementContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.setStatementOptionValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetStatementOptionValue?: (ctx: SetStatementOptionValueContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declareQueryParametersStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclareQueryParametersStatement?: (ctx: DeclareQueryParametersStatementContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.declareQueryParametersStatementParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclareQueryParametersStatementParameter?: (ctx: DeclareQueryParametersStatementParameterContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.queryStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQueryStatement?: (ctx: QueryStatementContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpression?: (ctx: ExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.pipeExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPipeExpression?: (ctx: PipeExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.pipedOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPipedOperator?: (ctx: PipedOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.pipeSubExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPipeSubExpression?: (ctx: PipeSubExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.beforePipeExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBeforePipeExpression?: (ctx: BeforePipeExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.afterPipeOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAfterPipeOperator?: (ctx: AfterPipeOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.beforeOrAfterPipeOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBeforeOrAfterPipeOperator?: (ctx: BeforeOrAfterPipeOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.forkPipeOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForkPipeOperator?: (ctx: ForkPipeOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.asOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAsOperator?: (ctx: AsOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.assertSchemaOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAssertSchemaOperator?: (ctx: AssertSchemaOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.consumeOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConsumeOperator?: (ctx: ConsumeOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.countOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCountOperator?: (ctx: CountOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.countOperatorAsClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCountOperatorAsClause?: (ctx: CountOperatorAsClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.distinctOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDistinctOperator?: (ctx: DistinctOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.distinctOperatorStarTarget`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDistinctOperatorStarTarget?: (ctx: DistinctOperatorStarTargetContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.distinctOperatorColumnListTarget`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDistinctOperatorColumnListTarget?: (ctx: DistinctOperatorColumnListTargetContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.evaluateOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEvaluateOperator?: (ctx: EvaluateOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.evaluateOperatorSchemaClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEvaluateOperatorSchemaClause?: (ctx: EvaluateOperatorSchemaClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.extendOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExtendOperator?: (ctx: ExtendOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.executeAndCacheOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExecuteAndCacheOperator?: (ctx: ExecuteAndCacheOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.facetByOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFacetByOperator?: (ctx: FacetByOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.facetByOperatorWithOperatorClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFacetByOperatorWithOperatorClause?: (ctx: FacetByOperatorWithOperatorClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.facetByOperatorWithExpressionClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFacetByOperatorWithExpressionClause?: (ctx: FacetByOperatorWithExpressionClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperator?: (ctx: FindOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorParametersWhereClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorParametersWhereClause?: (ctx: FindOperatorParametersWhereClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorInClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorInClause?: (ctx: FindOperatorInClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorProjectClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorProjectClause?: (ctx: FindOperatorProjectClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorProjectExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorProjectExpression?: (ctx: FindOperatorProjectExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorColumnExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorColumnExpression?: (ctx: FindOperatorColumnExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorOptionalColumnType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorOptionalColumnType?: (ctx: FindOperatorOptionalColumnTypeContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorPackExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorPackExpression?: (ctx: FindOperatorPackExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorProjectSmartClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorProjectSmartClause?: (ctx: FindOperatorProjectSmartClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorProjectAwayClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorProjectAwayClause?: (ctx: FindOperatorProjectAwayClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorProjectAwayStar`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorProjectAwayStar?: (ctx: FindOperatorProjectAwayStarContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorProjectAwayColumnList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorProjectAwayColumnList?: (ctx: FindOperatorProjectAwayColumnListContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorSource`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorSource?: (ctx: FindOperatorSourceContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.findOperatorSourceEntityExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFindOperatorSourceEntityExpression?: (ctx: FindOperatorSourceEntityExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.forkOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForkOperator?: (ctx: ForkOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.forkOperatorFork`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForkOperatorFork?: (ctx: ForkOperatorForkContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.forkOperatorExpressionName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForkOperatorExpressionName?: (ctx: ForkOperatorExpressionNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.forkOperatorExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForkOperatorExpression?: (ctx: ForkOperatorExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.forkOperatorPipedOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForkOperatorPipedOperator?: (ctx: ForkOperatorPipedOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.getSchemaOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGetSchemaOperator?: (ctx: GetSchemaOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphMarkComponentsOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphMarkComponentsOperator?: (ctx: GraphMarkComponentsOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphMatchOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphMatchOperator?: (ctx: GraphMatchOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphMatchPattern`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphMatchPattern?: (ctx: GraphMatchPatternContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphMatchPatternNode`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphMatchPatternNode?: (ctx: GraphMatchPatternNodeContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphMatchPatternUnnamedEdge`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphMatchPatternUnnamedEdge?: (ctx: GraphMatchPatternUnnamedEdgeContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphMatchPatternNamedEdge`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphMatchPatternNamedEdge?: (ctx: GraphMatchPatternNamedEdgeContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphMatchPatternRange`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphMatchPatternRange?: (ctx: GraphMatchPatternRangeContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphMatchWhereClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphMatchWhereClause?: (ctx: GraphMatchWhereClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphMatchProjectClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphMatchProjectClause?: (ctx: GraphMatchProjectClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphToTableOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphToTableOperator?: (ctx: GraphToTableOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphToTableOutput`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphToTableOutput?: (ctx: GraphToTableOutputContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphToTableAsClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphToTableAsClause?: (ctx: GraphToTableAsClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.graphShortestPathsOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGraphShortestPathsOperator?: (ctx: GraphShortestPathsOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.invokeOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInvokeOperator?: (ctx: InvokeOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.joinOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJoinOperator?: (ctx: JoinOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.joinOperatorOnClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJoinOperatorOnClause?: (ctx: JoinOperatorOnClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.joinOperatorWhereClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJoinOperatorWhereClause?: (ctx: JoinOperatorWhereClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.lookupOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLookupOperator?: (ctx: LookupOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.macroExpandOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMacroExpandOperator?: (ctx: MacroExpandOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.macroExpandEntityGroup`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMacroExpandEntityGroup?: (ctx: MacroExpandEntityGroupContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.entityGroupExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEntityGroupExpression?: (ctx: EntityGroupExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.makeGraphOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMakeGraphOperator?: (ctx: MakeGraphOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.makeGraphIdClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMakeGraphIdClause?: (ctx: MakeGraphIdClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.makeGraphTablesAndKeysClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMakeGraphTablesAndKeysClause?: (ctx: MakeGraphTablesAndKeysClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.makeGraphPartitionedByClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMakeGraphPartitionedByClause?: (ctx: MakeGraphPartitionedByClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.makeSeriesOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMakeSeriesOperator?: (ctx: MakeSeriesOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.makeSeriesOperatorOnClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMakeSeriesOperatorOnClause?: (ctx: MakeSeriesOperatorOnClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.makeSeriesOperatorAggregation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMakeSeriesOperatorAggregation?: (ctx: MakeSeriesOperatorAggregationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.makeSeriesOperatorExpressionDefaultClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMakeSeriesOperatorExpressionDefaultClause?: (ctx: MakeSeriesOperatorExpressionDefaultClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.makeSeriesOperatorInRangeClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMakeSeriesOperatorInRangeClause?: (ctx: MakeSeriesOperatorInRangeClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.makeSeriesOperatorFromToStepClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMakeSeriesOperatorFromToStepClause?: (ctx: MakeSeriesOperatorFromToStepClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.makeSeriesOperatorByClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMakeSeriesOperatorByClause?: (ctx: MakeSeriesOperatorByClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.mvapplyOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMvapplyOperator?: (ctx: MvapplyOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.mvapplyOperatorLimitClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMvapplyOperatorLimitClause?: (ctx: MvapplyOperatorLimitClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.mvapplyOperatorIdClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMvapplyOperatorIdClause?: (ctx: MvapplyOperatorIdClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.mvapplyOperatorExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMvapplyOperatorExpression?: (ctx: MvapplyOperatorExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.mvapplyOperatorExpressionToClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMvapplyOperatorExpressionToClause?: (ctx: MvapplyOperatorExpressionToClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.mvexpandOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMvexpandOperator?: (ctx: MvexpandOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.mvexpandOperatorExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMvexpandOperatorExpression?: (ctx: MvexpandOperatorExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.parseOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParseOperator?: (ctx: ParseOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.parseOperatorKindClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParseOperatorKindClause?: (ctx: ParseOperatorKindClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.parseOperatorFlagsClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParseOperatorFlagsClause?: (ctx: ParseOperatorFlagsClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.parseOperatorNameAndOptionalType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParseOperatorNameAndOptionalType?: (ctx: ParseOperatorNameAndOptionalTypeContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.parseOperatorPattern`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParseOperatorPattern?: (ctx: ParseOperatorPatternContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.parseOperatorPatternSegment`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParseOperatorPatternSegment?: (ctx: ParseOperatorPatternSegmentContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.parseWhereOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParseWhereOperator?: (ctx: ParseWhereOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.parseKvOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParseKvOperator?: (ctx: ParseKvOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.parseKvWithClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParseKvWithClause?: (ctx: ParseKvWithClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.partitionOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPartitionOperator?: (ctx: PartitionOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.partitionOperatorInClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPartitionOperatorInClause?: (ctx: PartitionOperatorInClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.partitionOperatorSubExpressionBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPartitionOperatorSubExpressionBody?: (ctx: PartitionOperatorSubExpressionBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.partitionOperatorFullExpressionBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPartitionOperatorFullExpressionBody?: (ctx: PartitionOperatorFullExpressionBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.partitionByOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPartitionByOperator?: (ctx: PartitionByOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.partitionByOperatorIdClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPartitionByOperatorIdClause?: (ctx: PartitionByOperatorIdClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.printOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPrintOperator?: (ctx: PrintOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.projectAwayOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProjectAwayOperator?: (ctx: ProjectAwayOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.projectKeepOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProjectKeepOperator?: (ctx: ProjectKeepOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.projectOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProjectOperator?: (ctx: ProjectOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.projectRenameOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProjectRenameOperator?: (ctx: ProjectRenameOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.projectReorderOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProjectReorderOperator?: (ctx: ProjectReorderOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.projectReorderExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProjectReorderExpression?: (ctx: ProjectReorderExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.reduceByOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReduceByOperator?: (ctx: ReduceByOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.reduceByWithClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReduceByWithClause?: (ctx: ReduceByWithClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.renderOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRenderOperator?: (ctx: RenderOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.renderOperatorWithClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRenderOperatorWithClause?: (ctx: RenderOperatorWithClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.renderOperatorLegacyPropertyList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRenderOperatorLegacyPropertyList?: (ctx: RenderOperatorLegacyPropertyListContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.renderOperatorProperty`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRenderOperatorProperty?: (ctx: RenderOperatorPropertyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.renderPropertyNameList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRenderPropertyNameList?: (ctx: RenderPropertyNameListContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.renderOperatorLegacyProperty`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRenderOperatorLegacyProperty?: (ctx: RenderOperatorLegacyPropertyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.sampleDistinctOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSampleDistinctOperator?: (ctx: SampleDistinctOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.sampleOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSampleOperator?: (ctx: SampleOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scanOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScanOperator?: (ctx: ScanOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scanOperatorOrderByClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScanOperatorOrderByClause?: (ctx: ScanOperatorOrderByClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scanOperatorPartitionByClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScanOperatorPartitionByClause?: (ctx: ScanOperatorPartitionByClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scanOperatorDeclareClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScanOperatorDeclareClause?: (ctx: ScanOperatorDeclareClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scanOperatorStep`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScanOperatorStep?: (ctx: ScanOperatorStepContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scanOperatorStepOutputClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScanOperatorStepOutputClause?: (ctx: ScanOperatorStepOutputClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scanOperatorBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScanOperatorBody?: (ctx: ScanOperatorBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scanOperatorAssignment`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScanOperatorAssignment?: (ctx: ScanOperatorAssignmentContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.searchOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSearchOperator?: (ctx: SearchOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.searchOperatorStarAndExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSearchOperatorStarAndExpression?: (ctx: SearchOperatorStarAndExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.searchOperatorInClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSearchOperatorInClause?: (ctx: SearchOperatorInClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.serializeOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSerializeOperator?: (ctx: SerializeOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.sortOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSortOperator?: (ctx: SortOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.orderedExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOrderedExpression?: (ctx: OrderedExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.sortOrdering`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSortOrdering?: (ctx: SortOrderingContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.summarizeOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSummarizeOperator?: (ctx: SummarizeOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.summarizeOperatorByClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSummarizeOperatorByClause?: (ctx: SummarizeOperatorByClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.summarizeOperatorLegacyBinClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSummarizeOperatorLegacyBinClause?: (ctx: SummarizeOperatorLegacyBinClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.takeOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTakeOperator?: (ctx: TakeOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.topOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTopOperator?: (ctx: TopOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.topHittersOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTopHittersOperator?: (ctx: TopHittersOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.topHittersOperatorByClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTopHittersOperatorByClause?: (ctx: TopHittersOperatorByClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.topNestedOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTopNestedOperator?: (ctx: TopNestedOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.topNestedOperatorPart`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTopNestedOperatorPart?: (ctx: TopNestedOperatorPartContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.topNestedOperatorWithOthersClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTopNestedOperatorWithOthersClause?: (ctx: TopNestedOperatorWithOthersClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.unionOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnionOperator?: (ctx: UnionOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.unionOperatorExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnionOperatorExpression?: (ctx: UnionOperatorExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.whereOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhereOperator?: (ctx: WhereOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.contextualSubExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitContextualSubExpression?: (ctx: ContextualSubExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.contextualPipeExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitContextualPipeExpression?: (ctx: ContextualPipeExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.contextualPipeExpressionPipedOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitContextualPipeExpressionPipedOperator?: (ctx: ContextualPipeExpressionPipedOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.strictQueryOperatorParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStrictQueryOperatorParameter?: (ctx: StrictQueryOperatorParameterContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.relaxedQueryOperatorParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRelaxedQueryOperatorParameter?: (ctx: RelaxedQueryOperatorParameterContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.queryOperatorProperty`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQueryOperatorProperty?: (ctx: QueryOperatorPropertyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.namedExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNamedExpression?: (ctx: NamedExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.namedExpressionNameClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNamedExpressionNameClause?: (ctx: NamedExpressionNameClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.namedExpressionNameList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNamedExpressionNameList?: (ctx: NamedExpressionNameListContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scopedFunctionCallExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScopedFunctionCallExpression?: (ctx: ScopedFunctionCallExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.unnamedExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnnamedExpression?: (ctx: UnnamedExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.logicalOrExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogicalOrExpression?: (ctx: LogicalOrExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.logicalOrOperation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogicalOrOperation?: (ctx: LogicalOrOperationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.logicalAndExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogicalAndExpression?: (ctx: LogicalAndExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.logicalAndOperation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogicalAndOperation?: (ctx: LogicalAndOperationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.equalityExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEqualityExpression?: (ctx: EqualityExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.equalsEqualityExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEqualsEqualityExpression?: (ctx: EqualsEqualityExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.listEqualityExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitListEqualityExpression?: (ctx: ListEqualityExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.betweenEqualityExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBetweenEqualityExpression?: (ctx: BetweenEqualityExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.starEqualityExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStarEqualityExpression?: (ctx: StarEqualityExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.relationalExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRelationalExpression?: (ctx: RelationalExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.additiveExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAdditiveExpression?: (ctx: AdditiveExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.additiveOperation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAdditiveOperation?: (ctx: AdditiveOperationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.multiplicativeExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMultiplicativeExpression?: (ctx: MultiplicativeExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.multiplicativeOperation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMultiplicativeOperation?: (ctx: MultiplicativeOperationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.stringOperatorExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStringOperatorExpression?: (ctx: StringOperatorExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.stringBinaryOperatorExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStringBinaryOperatorExpression?: (ctx: StringBinaryOperatorExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.stringBinaryOperation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStringBinaryOperation?: (ctx: StringBinaryOperationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.stringBinaryOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStringBinaryOperator?: (ctx: StringBinaryOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.stringStarOperatorExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStringStarOperatorExpression?: (ctx: StringStarOperatorExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.invocationExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInvocationExpression?: (ctx: InvocationExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.functionCallOrPathExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionCallOrPathExpression?: (ctx: FunctionCallOrPathExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.functionCallOrPathRoot`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionCallOrPathRoot?: (ctx: FunctionCallOrPathRootContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.functionCallOrPathPathExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionCallOrPathPathExpression?: (ctx: FunctionCallOrPathPathExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.functionCallOrPathOperation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionCallOrPathOperation?: (ctx: FunctionCallOrPathOperationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.functionCallOrPathPathOperation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionCallOrPathPathOperation?: (ctx: FunctionCallOrPathPathOperationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.functionCallOrPathElementOperation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionCallOrPathElementOperation?: (ctx: FunctionCallOrPathElementOperationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.legacyFunctionCallOrPathElementOperation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLegacyFunctionCallOrPathElementOperation?: (ctx: LegacyFunctionCallOrPathElementOperationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.toScalarExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitToScalarExpression?: (ctx: ToScalarExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.toTableExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitToTableExpression?: (ctx: ToTableExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.noOptimizationParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNoOptimizationParameter?: (ctx: NoOptimizationParameterContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.dotCompositeFunctionCallExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDotCompositeFunctionCallExpression?: (ctx: DotCompositeFunctionCallExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.dotCompositeFunctionCallOperation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDotCompositeFunctionCallOperation?: (ctx: DotCompositeFunctionCallOperationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.functionCallExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionCallExpression?: (ctx: FunctionCallExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.namedFunctionCallExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNamedFunctionCallExpression?: (ctx: NamedFunctionCallExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.argumentExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArgumentExpression?: (ctx: ArgumentExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.countExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCountExpression?: (ctx: CountExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.starExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStarExpression?: (ctx: StarExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPrimaryExpression?: (ctx: PrimaryExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.nameReferenceWithDataScope`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNameReferenceWithDataScope?: (ctx: NameReferenceWithDataScopeContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.dataScopeClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDataScopeClause?: (ctx: DataScopeClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.parenthesizedExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParenthesizedExpression?: (ctx: ParenthesizedExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.rangeExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRangeExpression?: (ctx: RangeExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.entityExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEntityExpression?: (ctx: EntityExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.entityPathOrElementExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEntityPathOrElementExpression?: (ctx: EntityPathOrElementExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.entityPathOrElementOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEntityPathOrElementOperator?: (ctx: EntityPathOrElementOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.entityPathOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEntityPathOperator?: (ctx: EntityPathOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.entityElementOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEntityElementOperator?: (ctx: EntityElementOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.legacyEntityPathElementOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLegacyEntityPathElementOperator?: (ctx: LegacyEntityPathElementOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.entityName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEntityName?: (ctx: EntityNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.entityNameReference`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEntityNameReference?: (ctx: EntityNameReferenceContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.atSignName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAtSignName?: (ctx: AtSignNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.extendedPathName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExtendedPathName?: (ctx: ExtendedPathNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.wildcardedEntityExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWildcardedEntityExpression?: (ctx: WildcardedEntityExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.wildcardedPathExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWildcardedPathExpression?: (ctx: WildcardedPathExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.wildcardedPathName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWildcardedPathName?: (ctx: WildcardedPathNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.contextualDataTableExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitContextualDataTableExpression?: (ctx: ContextualDataTableExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.dataTableExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDataTableExpression?: (ctx: DataTableExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.rowSchema`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRowSchema?: (ctx: RowSchemaContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.rowSchemaColumnDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRowSchemaColumnDeclaration?: (ctx: RowSchemaColumnDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.externalDataExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExternalDataExpression?: (ctx: ExternalDataExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.externalDataWithClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExternalDataWithClause?: (ctx: ExternalDataWithClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.externalDataWithClauseProperty`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExternalDataWithClauseProperty?: (ctx: ExternalDataWithClausePropertyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.materializedViewCombineExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMaterializedViewCombineExpression?: (ctx: MaterializedViewCombineExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.materializeViewCombineBaseClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMaterializeViewCombineBaseClause?: (ctx: MaterializeViewCombineBaseClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.materializedViewCombineDeltaClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMaterializedViewCombineDeltaClause?: (ctx: MaterializedViewCombineDeltaClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.materializedViewCombineAggregationsClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMaterializedViewCombineAggregationsClause?: (ctx: MaterializedViewCombineAggregationsClauseContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.scalarType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitScalarType?: (ctx: ScalarTypeContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.extendedScalarType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExtendedScalarType?: (ctx: ExtendedScalarTypeContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.parameterName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameterName?: (ctx: ParameterNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.simpleNameReference`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSimpleNameReference?: (ctx: SimpleNameReferenceContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.extendedNameReference`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExtendedNameReference?: (ctx: ExtendedNameReferenceContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.wildcardedNameReference`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWildcardedNameReference?: (ctx: WildcardedNameReferenceContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.simpleOrWildcardedNameReference`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSimpleOrWildcardedNameReference?: (ctx: SimpleOrWildcardedNameReferenceContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.identifierName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifierName?: (ctx: IdentifierNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.keywordName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitKeywordName?: (ctx: KeywordNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.extendedKeywordName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExtendedKeywordName?: (ctx: ExtendedKeywordNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.escapedName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEscapedName?: (ctx: EscapedNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.identifierOrKeywordName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifierOrKeywordName?: (ctx: IdentifierOrKeywordNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.identifierOrKeywordOrEscapedName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifierOrKeywordOrEscapedName?: (ctx: IdentifierOrKeywordOrEscapedNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.identifierOrExtendedKeywordOrEscapedName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifierOrExtendedKeywordOrEscapedName?: (ctx: IdentifierOrExtendedKeywordOrEscapedNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.identifierOrExtendedKeywordName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifierOrExtendedKeywordName?: (ctx: IdentifierOrExtendedKeywordNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.wildcardedName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWildcardedName?: (ctx: WildcardedNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.wildcardedNamePrefix`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWildcardedNamePrefix?: (ctx: WildcardedNamePrefixContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.wildcardedNameSegment`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWildcardedNameSegment?: (ctx: WildcardedNameSegmentContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.literalExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLiteralExpression?: (ctx: LiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.unsignedLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnsignedLiteralExpression?: (ctx: UnsignedLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.numberLikeLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNumberLikeLiteralExpression?: (ctx: NumberLikeLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.numericLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNumericLiteralExpression?: (ctx: NumericLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.signedLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSignedLiteralExpression?: (ctx: SignedLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.longLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLongLiteralExpression?: (ctx: LongLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.intLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIntLiteralExpression?: (ctx: IntLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.realLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRealLiteralExpression?: (ctx: RealLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.decimalLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDecimalLiteralExpression?: (ctx: DecimalLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.dateTimeLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDateTimeLiteralExpression?: (ctx: DateTimeLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.timeSpanLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTimeSpanLiteralExpression?: (ctx: TimeSpanLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.booleanLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBooleanLiteralExpression?: (ctx: BooleanLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.guidLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGuidLiteralExpression?: (ctx: GuidLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.typeLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeLiteralExpression?: (ctx: TypeLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.signedLongLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSignedLongLiteralExpression?: (ctx: SignedLongLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.signedRealLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSignedRealLiteralExpression?: (ctx: SignedRealLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.stringLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStringLiteralExpression?: (ctx: StringLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.dynamicLiteralExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDynamicLiteralExpression?: (ctx: DynamicLiteralExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonValue?: (ctx: JsonValueContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonObject`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonObject?: (ctx: JsonObjectContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonPair`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonPair?: (ctx: JsonPairContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonArray`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonArray?: (ctx: JsonArrayContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonBoolean`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonBoolean?: (ctx: JsonBooleanContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonDateTime`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonDateTime?: (ctx: JsonDateTimeContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonGuid`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonGuid?: (ctx: JsonGuidContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonNull`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonNull?: (ctx: JsonNullContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonString`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonString?: (ctx: JsonStringContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonTimeSpan`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonTimeSpan?: (ctx: JsonTimeSpanContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonLong`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonLong?: (ctx: JsonLongContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.jsonReal`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonReal?: (ctx: JsonRealContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementCommandExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementCommandExpression?: (ctx: ManagementCommandExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementCommandBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementCommandBody?: (ctx: ManagementCommandBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementTableWithSchemaBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementTableWithSchemaBody?: (ctx: ManagementTableWithSchemaBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementSchemaText`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementSchemaText?: (ctx: ManagementSchemaTextContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementSchemaToken`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementSchemaToken?: (ctx: ManagementSchemaTokenContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementTableTargetBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementTableTargetBody?: (ctx: ManagementTableTargetBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementDropTableBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementDropTableBody?: (ctx: ManagementDropTableBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementShowBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementShowBody?: (ctx: ManagementShowBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementIngestInlineBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementIngestInlineBody?: (ctx: ManagementIngestInlineBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementIngestFromUriBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementIngestFromUriBody?: (ctx: ManagementIngestFromUriBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementIngestInlineProperties`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementIngestInlineProperties?: (ctx: ManagementIngestInlinePropertiesContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementIngestInlinePropertyToken`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementIngestInlinePropertyToken?: (ctx: ManagementIngestInlinePropertyTokenContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementIngestSourceText`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementIngestSourceText?: (ctx: ManagementIngestSourceTextContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementIngestSourceToken`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementIngestSourceToken?: (ctx: ManagementIngestSourceTokenContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementFromQueryPayload`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementFromQueryPayload?: (ctx: ManagementFromQueryPayloadContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementGenericBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementGenericBody?: (ctx: ManagementGenericBodyContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementCommandName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementCommandName?: (ctx: ManagementCommandNameContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementCommandNameSegment`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementCommandNameSegment?: (ctx: ManagementCommandNameSegmentContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementCommandIdentifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementCommandIdentifier?: (ctx: ManagementCommandIdentifierContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementCommandToken`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementCommandToken?: (ctx: ManagementCommandTokenContext) => Result;
    /**
     * Visit a parse tree produced by `KqlParser.managementCommandQueryToken`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitManagementCommandQueryToken?: (ctx: ManagementCommandQueryTokenContext) => Result;
}

